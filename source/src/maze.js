import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import {
  groupText,
} from "./maze_helper.js";

const info = {
  name: "maze",
  parameters: {
    correct: {
      // this is where the correct sentence will go
      type: ParameterType.STRING,
      pretty_name: "Stimulus",
      default: undefined,
      description: "The string to be displayed in Maze style",
    },
    distractor: {
      // the distractor sentence
      type: ParameterType.STRING,
      pretty_name: "Stimulus",
      default: undefined,
      description: "The string to be displayed in Maze style",
    },
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: undefined,
      description: "html for the top",
    },
    order: {
      // I guess you can care about left/right presentation order
      type: ParameterType.ARRAY, // let's hope this works!
      pretty_name: "Order",
      default: null,
      description: "Why though", //TODO check this works
    },
    redo: {
      type: ParameterType.BOOL,
      pretty_name: "Redo",
      default: true,
      description: "It's redo mode",
    },
    delay: {
      type: ParameterType.FLOAT,
      pretty_name: "Delay",
      default: 500,
      description:
        "Time to wait after a mistake before registering next keypress",
    },
    normal_message: {
      type: ParameterType.STRING,
      pretty_name: "Normal message",
      default: "",
      description: "What to display normally",
    },
    error_message: {
      type: ParameterType.STRING,
      pretty_name: "Error message",
      default: '<p style="color:red;"> Wrong!</p>',
      description: "What to display on mistakes during delay",
    },
    redo_message: {
      type: ParameterType.STRING,
      pretty_name: "Redo message",
      default: '<p style="color:blue;"> Try again.</p>',
      description: "What to display post mistake once keypresses will record",
    },
    trial_duration: {
      type: ParameterType.FLOAT,
      pretty_name: "The maximum stimulus duration",
      default: -1,
      description: "The maximum amount of time a trial lasts.",
    },
    choice_left: {
      type: ParameterType.KEYCODE,
      pretty_name: "Choice Left",
      default: ["e"],
      description: "The keys that select the left-side word.",
    },
    choice_right: {
      type: ParameterType.KEYCODE,
      pretty_name: "Choice Left",
      default: ["i"],
      description: "The keys that select the right-side word.",
    },
    background_color: {
      type: ParameterType.STRING,
      pretty_name: "Background color",
      default: "rgb(255,255,255)",
      description:
        "background_color r, g and b value as javascript object such as: " +
        '"rgb(230,230,230)" or "gray"',
    },
    font_color: {
      //sure why not
      type: ParameterType.STRING,
      pretty_name: "Font color",
      default: "rgb(0,0,0)",
      description:
        "The rgb values in which the letters will be presented, such as: " +
        "rgb(0,0,0)",
    },
    font_family: {
      //sure why not
      type: ParameterType.STRING,
      pretty_name: "The familiy of the font that is used to draw the words.",
      default: "Times New Roman",
      description:
        "The final font will be computed from the family, and font size",
    },
    font_size: {
      type: ParameterType.INT,
      pretty_name: "The size of the font.",
      default: 60,
      description:
        "The final font will be computed from the family, and font size",
    },
    width: {
      type: ParameterType.INT,
      pretty_name: "width",
      default: 1000,
      description:
        "The width of the word display container in pixels. Also controls the gap between words.",
    },
    height: {
      type: ParameterType.INT,
      pretty_name: "height",
      default: 100,
      description:
        "The height of the word display container in pixels.",
    },
    grouping_string: {
      //sure why not
      type: ParameterType.STRING,
      pretty_name: "grouping string",
      default: null,
      description:
        "The string used to split the string in to parts. The parts are " +
        "presented together. This allows to present multiple words as " +
        "group if the argument isn't specified every single word is " +
        "treated as group. You should make sure that the used argument " +
        "doesn't appear at other locations than at boundaries of groups, " +
        "because the grouping character is removed from the string. a " +
        "'/' can be used quite handy for example.",
    },
  },
};
// private variables

let group_index = 0; // keep track of word position
let correct = []; // list of correct words
let distractor = []; // list of distractor words
let order = []; // list of whether correct word is left or right

let old_html = ""; // be able to reset at end of trial
let font_size = 60; // base font size in px
let gelement = null; // where things are displayed
let valid_keys = null; // the valid keys or choices for a response
let left_keys = []; // keys to select left option
let right_keys = []; // keys to select right option

let reactiontimes = []; // store for rts to first press
let cumulative_rts = []; // store for rts to correct press
let cumulative_rt = 0; // count up cumulative rt per word
let responses = []; // stores responses (correct / incorrect)

let error_message = ""; // message options
let redo_message = "";
let normal_message = "";

let first = true; // is this the first try?

let delay = null; // what is time delay before redoing
let redo = null; // are we in redo mode

/**
 * Setup the variables for use at the start of a new trial
 */
function setupVariables(display_element, trial_pars) {
  group_index = 0;
  order = [];
  cumulative_rts = [];
  cumulative_rt = 0;
  responses = [];

  old_html = display_element.innerHTML;
  font_size = trial_pars.font_size;
  gelement = display_element;
  valid_keys = trial_pars.choice_left.concat(trial_pars.choice_right);
  left_keys = trial_pars.choice_left;
  right_keys = trial_pars.choice_right;
  reactiontimes = [];
  error_message = trial_pars.error_message;
  redo_message = trial_pars.redo_message;
  normal_message = trial_pars.normal_message;
  redo = trial_pars.redo;
  delay = trial_pars.delay;

  var new_html = "<div id='status'>" + trial_pars.prompt + "</div>";
  display_element.innerHTML = new_html;
  createWordDisplay(display_element, trial_pars);
  let div = createTextArea(display_element);
  div.innerHTML = normal_message;

  correct = groupText(trial_pars.correct, trial_pars.grouping_string);
  distractor = groupText(trial_pars.distractor, trial_pars.grouping_string);
  console.assert(
    correct.length == distractor.length,
    "Correct and distractor do not have the same length"
  );
  if (trial_pars.order === null) {
    for (let i = 0; i < correct.length; i++) {
      order[i] = Math.round(Math.random());
    }
  } else {
    order = trial_pars.order;
  }
  console.assert(
    correct.length == order.length,
    "Order is not the same length as correct and distractor"
  );
}

function createTextArea(display_element) {
  let div = document.createElement("div");
  display_element.appendChild(div);
  div.style.height = "300px";
  div.style.display = "flex";
  div.style.justifyContent = "center";
  div.style.alignContent = "center";
  div.id = "feedback";
  return div;
}
function createWordDisplay(display_element, trial_pars) {
  let container = document.createElement("div");
  container.id = "maze-word-container";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.gap = (trial_pars.width * 0.1) + "px";
  container.style.fontFamily = trial_pars.font_family;
  container.style.fontSize = trial_pars.font_size + "px";
  container.style.color = trial_pars.font_color;
  container.style.backgroundColor = trial_pars.background_color;
  container.style.width = trial_pars.width + "px";
  container.style.height = trial_pars.height + "px";
  container.style.margin = "0 auto";

  let leftWord = document.createElement("span");
  leftWord.id = "maze-left-word";
  leftWord.style.flex = "1";
  leftWord.style.textAlign = "right";
  container.appendChild(leftWord);

  let rightWord = document.createElement("span");
  rightWord.id = "maze-right-word";
  rightWord.style.flex = "1";
  rightWord.style.textAlign = "left";
  container.appendChild(rightWord);

  display_element.appendChild(container);
}

function scaledFontSize(word) {
  if (word.length > 12) {
    return Math.floor(font_size * 12 / word.length) + "px";
  }
  return font_size + "px";
}

function drawStimulus(group_index) {
  let leftEl = document.getElementById("maze-left-word");
  let rightEl = document.getElementById("maze-right-word");
  let leftWord, rightWord;
  if (order[group_index] === 0) {
    leftWord = correct[group_index];
    rightWord = distractor[group_index];
  } else {
    leftWord = distractor[group_index];
    rightWord = correct[group_index];
  }
  leftEl.textContent = leftWord;
  leftEl.style.fontSize = scaledFontSize(leftWord);
  rightEl.textContent = rightWord;
  rightEl.style.fontSize = scaledFontSize(rightWord);
}

/**
 * Callback for when the participant presses a valid key.
 */

class MazePlugin {
  /**
   * Initiates the trial.
   * @param {Object} parameter
   */
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial_pars) {
    var start_time = performance.now();
    let trial_data = {
      rt: [],
      cumrt: [],
      correct: [],
      words: [],
      distractors: [],
      order: [],
    };
    const installResponse = () => {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterResponse,
        valid_responses: valid_keys,
        rt_method: "performance",
        persist: false, // We reinstall the response, because
        // otherwise the rt is cumulative.
        allow_held_key: false,
      });
    };

    const afterResponse = (info) => {
      function mapKey(letter) {
        if (left_keys.includes(letter)) {
          return 0;
        }
        if (right_keys.includes(letter)) {
          return 1;
        }
      }

      let selection = mapKey(info.key);
      if (first == true) {
        //this is their first try
        reactiontimes.push(info.rt);
        if (order[group_index] == selection) {
          //correct selection
          responses.push(1);
        } else {
          responses.push(0);
        } //incorrect selection
      }
      cumulative_rt += info.rt;

      if (order[group_index] == selection) {
        //correct selection
        //reset things to move onto next word
        cumulative_rts.push(cumulative_rt);
        group_index++;
        cumulative_rt = 0;
        first = true;
        if (group_index >= order.length) {
          end_trial();
        } else {
          let div = document.getElementById("feedback");
          div.innerHTML = normal_message;
          installResponse();
          drawStimulus(group_index);
        }
      } else {
        //wrong selection
        first = false;
        if (redo == false) {
          //end this
          reactiontimes.push(info.rt);
          end_trial();
        } else {
          if (delay === null) {
            //go directly to redo
            handleMistake();
          } else {
            //do delay, then redo
            cumulative_rt += delay;
            let div = document.getElementById("feedback");
            div.innerHTML = error_message;
            this.jsPsych.pluginAPI.setTimeout(handleMistake, delay);
          }
        }
      }
    };

    const handleMistake = () => {
      let div = document.getElementById("feedback");
      div.innerHTML = redo_message;
      installResponse();
    };

    setupVariables(display_element, trial_pars);
    installResponse();
    drawStimulus(group_index);

    let end_trial = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      gelement.innerHTML = old_html;
      trial_data.rt = reactiontimes;
      trial_data.cumrt = cumulative_rts;
      trial_data.correct = responses;
      trial_data.words = correct;
      trial_data.distractors = distractor;
      trial_data.order = order;
      console.log(trial_data);
      this.jsPsych.finishTrial(trial_data);
    };
  }
}
export default MazePlugin;
