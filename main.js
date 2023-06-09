import {initJsPsych} from 'jspsych';
//var _ = require('lodash');
let jsPsych = initJsPsych({
    exclusions: {
        min_width : "600px",
        min_height : "1200px"
    }
});
//TODO add a stimuli checker for length

// add a thing that does counterbalancing w/o lists
/* given a list of grouped types -- determine item numbers for each set
then randomize 1/2 of the items to be each type 
then take the lists and shuffle all together

*/
function shuffle(arr) {
    var i = arr.length, j, temp;
    while(--i > 0){
      j = Math.floor(Math.random()*(i+1));
      temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
  }

function counterbalance(item_types, items){
    let select_items=[]
    for (let i = 0; i < item_types.length; i++) { // for each grouping
        let relevant = items.filter(item => {return (item_types[i].includes(item.item_type))}) // items of this grouping
        let relevant_ids=[];
        shuffle(relevant_ids)
        relevant.forEach(item => {
            if (!relevant_ids.includes(item.id)){relevant_ids.push(item.id)}});
            for (let j=0; j<item_types[i].length; j++){
            let item_type=item_types[i][j];
            let frac=relevant_ids.length/item_types[i].length;
            let start=Math.floor(j*frac);
            let end=Math.floor((j+1)*frac);
            for(let k=start; k<end; k++){
                let id = relevant_ids[k];
                relevant.forEach(item=>{
                    if(item.id==id & item.item_type==item_type){
                        select_items.push(item)
                    }});
            }
        }    
    }
    shuffle(select_items)
    return(select_items)
}


let ITEM_TYPES = [["filler"],
                ["and_comma","and_no_comma"],
                ["relative_high","relative_low"],
                ["adverb_high", "adverb_low"]]

const KEY_CODE_SPACE = ' ';
let PRACTICE_ITEMS = STIMULI.filter(item => { return(item.item_type=="practice")})

let TEST_ITEMS=STIMULI.filter(item => { return(item.item_type!=="practice")})

const foo=counterbalance(ITEM_TYPES, TEST_ITEMS)
console.log(foo)
let welcome_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : WELCOME_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let instruction_screen_practice = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_PRACTICE_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};


let present_text = {
    type : maze,
    correct : jsPsych.timelineVariable('correct'),
    distractor: jsPsych.timelineVariable('distractor')
}


let end_practice_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : PRE_TEST_INSTRUCTION,
    choices : [KEY_CODE_SPACE],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let end_experiment = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : POST_TEST_INSTRUCTION,
    choices : [],
    on_load: function() {
        //if (consent_given) {
            //uil.saveData();
        //}
        //else {
            //document.body.innerHTML = FINISHED_NO_CONSENT;
        //}
    }
}

function getTimeline(stimuli) {
    //////////////// timeline /////////////////////////////////
    let timeline = [];

    // Welcome the participant and guide them through the
    // consent forms and survey.
    //timeline.push(welcome_screen);

    // Obtain informed consent.
    //timeline.push(consent_procedure);

    // add survey
   // timeline.push(survey_procedure);

    // Add the different parts of the experiment to the timeline
    //timeline.push(instruction_screen_practice);

    let practice = {
        timeline: [
            //fixcross,
            present_text,
            //maybe_question
        ],
        timeline_variables: PRACTICE_ITEMS
    };

    timeline.push(practice);
    //timeline.push(end_practice_screen);

    /*let test = {
        timeline: [
            //fixcross,
            present_text,
            //maybe_question
        ],
        timeline_variables: stimuli.table
    }

    timeline.push(test);*/
    timeline.push(end_experiment);
    return timeline;
}


function main() {
    // Make sure you have updated your key in globals.js
    //uil.setAccessKey(ACCESS_KEY);
    //uil.stopIfExperimentClosed();

    // Option 1: client side randomization:
    let stimuli = STIMULI;
    //uil.browser.rejectMobileOrTablet();
    let timeline=getTimeline(stimuli)
    //console.log(timeline)
    jsPsych.run(timeline);

}

window.addEventListener('load', main);



/**
 * This function will pick a random list from the TEST_ITEMS array.
 *
 * Returns an object with a list and a table, the list will always indicate
 * which list has been chosen for the participant.
 *
 * @returns {object} object with list_name and table fields
 */
/*function pickRandomList() {
    let range = function (n) {
        let empty_array = [];
        let i;
        for (i = 0; i < n; i++) {
            empty_array.push(i);
        }
        return empty_array;
    }
    let num_lists = TEST_ITEMS.length;
    var shuffled_range = jsPsych.randomization.repeat(range(num_lists), 1)
    var retlist = TEST_ITEMS[shuffled_range[0]];
    return retlist
}*/

/*function findList(name) {
    let list = TEST_ITEMS.find((entry) => entry.list_name === name);
    if (!list) {
        let found = TEST_ITEMS.map((entry) => `"${entry.list_name}"`).join(', ');
        console.error(
            `List not found "${name}".\n` +
                'This name was configured on the UiL datastore server.\n' +
                `The following lists exist in stimuli.js: \n${found}`)
    }
    return list;
}*/
