var maze = (function(jspsych) {

    const MAZE_PLUGIN_NAME = 'maze';

    const info = {
        name: MAZE_PLUGIN_NAME,
        parameters : {
            correct : { // this is where the correct sentence will go
                type :          jspsych.ParameterType.STRING,
                pretty_name :   'Stimulus',
                default :       undefined,
                description :   'The string to be displayed in Maze style'
            },
            distractor: { // the distractor sentence 
                type :          jspsych.ParameterType.STRING,
                pretty_name :   'Stimulus',
                default :       undefined,
                description :   'The string to be displayed in Maze style'
            },
            order: { // I guess you can care about left/right presentation order
            	type: jspsych.ParameterType.ARRAY, // let's hope this works!
            	pretty_name: 'Order',
            	default: null,
            	description: "Why though" //TODO check this works
            },
            redo: {
            	type: jspsych.ParameterType.BOOL,
            	pretty_name: 'Redo',
            	default: true,
            	description: "It's redo mode"
            },
            delay: { 
            	type: jspsych.ParameterType.FLOAT, 
            	pretty_name: 'Delay',
            	default: 500,
            	description: "Time to wait after a mistake before registering next keypress"
            },
            normal_message: { 
            	type: jspsych.ParameterType.STRING,
            	pretty_name: 'Normal message',
            	default: '',
            	description: "What to display normally"
            },
            error_message: { 
            	type: jspsych.ParameterType.STRING, 
            	pretty_name: 'Error message',
            	default: '<p style="color:red;font-size:40px;"> Wrong!</p>',
            	description: "What to display on mistakes during delay"
            },
            redo_message: { 
            	type: jspsych.ParameterType.STRING,
            	pretty_name: 'Redo message',
            	default: '<p style="color:blue;font-size:40px;"> Try again.</p>',
            	description: "What to display post mistake once keypresses will record"
            },
            trial_duration : { 
                type :          jspsych.ParameterType.FLOAT,
                pretty_name :   "The maximum stimulus duration",
                default :       -1,
                description :   "The maximum amount of time a trial lasts." 
            },
            choice_left : { 
                type :          jspsych.ParameterType.KEYCODE,
                pretty_name :   "Choice Left",
                default :       ['e'],
                description :   "The keys that select the left-side word."
            },
            choice_right : { 
                type :          jspsych.ParameterType.KEYCODE,
                pretty_name :   "Choice Left",
                default :       ['i'],
                description :   "The keys that select the right-side word."
            },
            background_color : { 
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "Background color",
                default :       "rgb(255,255,255)",
                description :   "background_color r, g and b value as javascript object such as: " +
                    "\"rgb(230,230,230)\" or \"gray\""
            },
            font_color : { //sure why not
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "Font color",
                default :       'rgb(0,0,0)',
                description :   "The rgb values in which the letters will be presented, such as: " +
                    "rgb(0,0,0)"
            },
            font_family : { //sure why not
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "The familiy of the font that is used to draw the words.",
                default :       "Times New Roman",
                description :   "The final font will be computed from the family, and font size"
            },
            font_size : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "The size of the font.",
                default :       36,
                description :   "The final font will be computed from the family, and font size"
            },
            width : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "width",
                default :       600,
                description :   "The width of the canvas in which the spr moving window is presented."
            },
            height : {
                type :          jspsych.ParameterType.INT,
                pretty_name :   "height",
                default :       100,
                description :   "The height of the canvas in which the spr moving window is presented"
            },
            grouping_string : { //sure why not
                type :          jspsych.ParameterType.STRING,
                pretty_name :   "grouping string",
                default :       null,
                description :   "The string used to split the string in to parts. The parts are "  +
                    "presented together. This allows to present multiple words as "    +
                    "group if the argument isn't specified every single word is "      +
                    "treated as group. You should make sure that the used argument "   +
                    "doesn't appear at other locations than at boundaries of groups, " +
                    "because the grouping character is removed from the string. a " +
                    "'/' can be used quite handy for example."
            }
        }
    };
    // Reused names
    const SPR_CANVAS = "SprCanvas";


    /**
     * Class to represent the position of a word on a 2d canvas
     */
    class Pos {
        /**
         * @param {number} x the x position of a word
         * @param {number} y the y position of a word
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };

    /**
     * Class to contain some data about a word, on how to present it
     * on a canvas.
     */
    class TextInfo {

        /**
         * @param {string} txt, the text to draw at ctx
         * @param {Pos} position the position at which to draw text.
         * @param {} ctx the 2d drawing position.
         */
        constructor(text, position, ctx, record = false) {
            if (typeof(text) !== "string")
                console.error("TextInfo constructor text was not a String");
            if (typeof(record) !== "boolean")
                console.error("TextInfo constructor positions was not a Pos");
            this.text = text;
            this.pos = position;
            this.ctx = ctx
            this.metrics = ctx.measureText(this.text);
        }

        drawText() {
            this.ctx.fillText(this.text, this.pos.x, this.pos.y);
        }

        width() {
            return this.metrics.width;
        }
    };


    // private variables

    let group_index = 0;        // keep track of word position
    let correct = [];           // list of correct words
    let distractor = [];        // list of distractor words
    let correct_words = [];     // list of correct words & where to display them
    let distractor_words = [];  // list of distractors & where to display them
    let order = [];             // list of whether correct word is left or right
    
    let old_html=""             // be able to reset at end of trial
    let font = "";              // family of the font with px size
    let background_color = "";  // the color of the paper of the text.
    let font_color = "";        // the color of the text.
    let ctx = null;             // 2D drawing context
    let gwidth = 0;             // width of the canvas
    let gheight = 0;            // and the height.
    let gelement = null;        // where things are displayed
    let valid_keys = null;      // the valid keys or choices for a response
    let left_keys =[];          // keys to select left option
    let right_keys = [];        // keys to select right option

    let reactiontimes = [];     // store for rts to first press
    let cumulative_rts=[];      // store for rts to correct press
    let cumulative_rt=0;        // count up cumulative rt per word
    let responses =[];          // stores responses (correct / incorrect)

    
    let error_message = ""      // message options
    let redo_message = ""
    let normal_message=""

    let first=true;             // is this the first try?

    let delay=null;             // what is time delay before redoing
    let redo=null               // are we in redo mode
    


     




    /**
     * Splits text into tokens and discards empty strings. The
     * tokens are defined by the regular expression used to
     * split the string.
     *
     * @param {String} text The text to splint into tokens
     * @param {RegExp} re   The regular expression used to split the string
     *
     * @return An array of strings as tokens.
     */
    function createGroups(text, re) {
        return text.split(re).filter (
            function(word) {
                return word != "";
            }
        );
    };

    /**
    * Takes a text and grouping string, splits it on that
    * returns the list of groups (usually words)
    * but other groupingStrings will allow for other splits.
    */
    function groupText(text, groupingString) {
    	let stimulus = text;
        if (groupingString) {
            let grouping_re = RegExp(groupingString, 'ug');
            groups = createGroups(stimulus, grouping_re);
        }
        else {
            groups = createGroups(stimulus, RegExp('\\s', 'u'));
        }
        return (groups)
    }

    /**
     * Setup the variables for use at the start of a new trial
     */
    function setupVariables(display_element, trial_pars) {
        // reset state.
        group_index     = 0;
        correct_words = [];
        distractor_words = [];
        order=[];
        ctx             = null;
        
        //copy a lot of trial pars
        font = `${trial_pars.font_size}px ${trial_pars.font_family}`;
        background_color = trial_pars.background_color;
        font_color = trial_pars.font_color;
        gwidth = trial_pars.width;
        gheight = trial_pars.height;
        valid_keys = trial_pars.choice_left.concat(trial_pars.choice_right);
        left_keys= trial_pars.choice_left;
        right_keys=trial_pars.choice_right;
        reactiontimes = [];
        error_message = trial_pars.error_message;
        redo_message = trial_pars.redo_message;
        normal_message = trial_pars.normal_message;
        redo=trial_pars.redo
        delay=trial_pars.delay;

        //set up display
        gelement=display_element
        old_html = display_element.innerHTML;
        let foo = createTextArea(display_element)
        createCanvas(display_element, trial_pars);
        div = createTextArea(display_element)
        div.innerHTML=normal_message
        ctx.font = font;
        
        // process stimuli
        correct = groupText(trial_pars.correct, trial_pars.grouping_string);
        distractor = groupText(trial_pars.distractor, trial_pars.grouping_string);
        //check that things that should be the same length are!
        console.assert(
            correct.length==distractor.length,
            "Correct and distractor do not have the same length");
        if (trial_pars.order === null) {
            for (let i=0; i < correct.length; i++){
                order[i]=Math.round(Math.random())
            }
         }
         else {
            order=trial_pars.order
        }
         console.assert(
            correct.length==order.length,
            "Order is not the same length as correct and distractor");

        gatherWordInfo(correct, distractor, trial_pars);
    }

    function createTextArea(display_element){
        let div=document.createElement("div")
        display_element.appendChild(div)
        div.style.height="300px"
        div.style.display="flex"
        div.style.justifyContent="center"
        div.style.alignContent="center"
        return(div)
    }

    /**
     * Setup the canvas for use with this plugin
     *
     * @param {HTMLElement} display_element
     * @param {Object} trial Object with trial information
     */
    function createCanvas(display_element, trial_pars) {
        let canvas = document.createElement('canvas')
        canvas.setAttribute("width", trial_pars.width);
        canvas.setAttribute("height", trial_pars.height);
        canvas.style.padding=0;
        canvas.style.display="block";
        canvas.style.margin="auto";
        canvas.setAttribute("id", SPR_CANVAS);
        display_element.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    function gatherWordInfo(correct,distractor, trial_pars) {
        let delta_y = determineLineHeight(trial_pars.font_family, trial_pars.font_size);
        let word = 0;
        let center = trial_pars.width * .5;
        let padding = trial_pars.width * .1;
        const BASE_Y = delta_y * 1.5; // The height on which lines begin.
        let correct_text = null
        let distractor_text = null
        let correct_pos = null
        let distractor_pos = null

	    for (let i = 0; i < correct.length; i++) {
			correct_text = correct[i];
            distractor_text = distractor[i];
            if (order[i]==0) {
			    correct_pos= new Pos(center-padding-ctx.measureText(correct_text).width, BASE_Y);
                distractor_pos= new Pos(center+padding, BASE_Y);
            }
            else {
			    correct_pos= new Pos(center+padding, BASE_Y);
                distractor_pos= new Pos(center-padding-ctx.measureText(distractor_text).width, BASE_Y);
            }
			let correct_word = new TextInfo(correct_text, correct_pos, ctx);
			correct_words.push(correct_word);
			let distractor_word = new TextInfo(distractor_text, distractor_pos, ctx);
			distractor_words.push(distractor_word);
	    }
    }

    /**
     * Draws the stimulus on the canvas.
     */
    function drawStimulus() {
        // draw background
        ctx.fillStyle = background_color; // it's entertaining when you don't have this
        ctx.fillRect(0, 0, gwidth, gheight);

        // draw text
        ctx.fillStyle = font_color;

        let correct_word = correct_words[group_index];
        let distractor_word = distractor_words[group_index];
        correct_word.drawText();
        distractor_word.drawText()
    }



    



    /**
     * Callback for when the participant presses a valid key.
     */
    
       


    /**
     * Determines the expected height of a line, that is: how much should
     * y advance for each line in a text field.
     *
     * It's a hack, but is seems to work. TextMetrics should - in my
     * opinion - support this.
     *
     * Borrowed and adapted from:
     * https://stackoverflow.com/questions/11452022/measure-text-height-on-an-html5-canvas-element/19547748
     */
    function determineLineHeight(font, font_size) {
        let text = "Hello World";

        let div = document.createElement("div");
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top  = '-9999px';
        div.style.left = '-9999px';
        div.style.fontFamily = font;
        div.style.fontSize = font_size + 'pt'; // or 'px'
        document.body.appendChild(div);
        let height = div.offsetHeight;
        document.body.removeChild(div);
        return height;
    }

    class Maze {
        /**
         * Initiates the trial.
         * @param {Object} parameter
         */
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
          }

        installResponse = (trial_pars) => {
            var afterResponse=this.afterResponse

            this.jsPsych.pluginAPI.getKeyboardResponse(

                {
                    callback_function : afterResponse,
                    valid_responses : valid_keys,
                    rt_method : 'performance',
                    persist : false, // We reinstall the response, because
                    // otherwise the rt is cumulative.
                    allow_held_key: false
                }
            );
        }

        afterResponse = (info) =>{
        
            function mapKey(letter){
                if (left_keys.includes(letter)){
                    return 0
                }
                if (right_keys.includes(letter)){
                    return 1
                }
            }
    
            let selection=mapKey(info.key)
            if (first==true){ //this is their first try
                reactiontimes.push(info.rt)
                if (order[group_index]==selection){//correct selection
                    responses.push(1);
                }
                else {responses.push(0)} //incorrect selection
            }
            cumulative_rt+=info.rt
     
            if (order[group_index]==selection){//correct selection
            //reset things to move onto next word
                cumulative_rts.push(cumulative_rt)
                group_index++;
                cumulative_rt=0
                first=true
                if (group_index >= order.length) {
                    this.finish();
                }
                else {
                    div.innerHTML=normal_message
                    drawStimulus();
                    this.installResponse();
                }
            }
            else {//wrong selection
                first=false
                if (redo==false) { //end this
                    reactiontimes.push(info.rt)
                    this.finish();
                }
                if (delay===null){ //go directly to redo
                    this.handleMistake()
                }
                else{ //do delay, then redo
                    cumulative_rt+=delay
                    div.innerHTML=error_message
                    this.jsPsych.pluginAPI.setTimeout(this.handleMistake, delay);
                }
            }
        }
        
        handleMistake =() => {
                div.innerHTML=redo_message
                this.installResponse()
        }
        
        finish  = () => {

            let data = {
                rt: reactiontimes,
                cumrt: cumulative_rts,
                correct: responses,
                words: correct,
                distractors: distractor,
                order: order,
            }
    
            this.jsPsych.pluginAPI.clearAllTimeouts();
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
            gelement.innerHTML = old_html;
            this.jsPsych.finishTrial(data);
        }

        trial(display_element, trial_pars){

            setupVariables(display_element, trial_pars);
            this.installResponse();
            drawStimulus();
            if (trial_pars.trial_duration >= 0) {
                this.jsPsych.pluginAPI.setTimeout(this.finish, trial_pars.trial_duration);
            }
        }

    }

    Maze.info = info;
    return Maze;

})(jsPsychModule);
