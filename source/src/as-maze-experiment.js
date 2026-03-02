/**
 * @title expt1
 * @description
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";
//import SprButtonPlugin from "./spr-buttons.js";
import MazePlugin from "./maze.js";

import { initJsPsych } from "jspsych";

import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import CallFunctionPlugin from "@jspsych/plugin-call-function";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";

import { proliferate } from "./proliferate.js";
import { subset } from "./helper.js";

import { stimuli } from "./as-maze-stimuli.js";
import {
  choices,
  all_images,
  format_spr,
  give_feedback,
  format_header,
} from "./constants.js";

import {
  CONSENT,
  POST_SURVEY_QS,
  POST_SURVEY_TEXT,
  DEBRIEF,
  INSTRUCTIONS,
  INSTRUCTIONS2,
} from "./instructions.js";
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

const NUM_ITEMS = 2;
let done = 1;
const BONUS = 5;

const select_stimuli = subset(stimuli, NUM_ITEMS);
const trials = select_stimuli.length;
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych({
    on_close: function () {
      //console.log("start the thing");
      var data = jsPsych.data.get().values();
      //console.log("middle");
      //console.log(data);
      //console.log(data[0]);
      proliferate.submit(
        { trials: data },
        () => {
          //console.log("doing the thing");
        },
        (i) => {
          //console.log("waaaah");
          //console.log(JSON.stringify(i));
        }
      );
    },
  });

  let countCorrect = 0;
  let done = 1;
  let consent = {
    type: HtmlButtonResponsePlugin,
    stimulus: CONSENT,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let instructions2 = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS2,
    choices: ["Continue"],
    response_ends_trial: true,
  };
  let post_test_questions = {
    type: SurveyTextPlugin,
    preamble: POST_SURVEY_TEXT,
    questions: POST_SURVEY_QS,
  };

  let end_experiment = {
    type: HtmlButtonResponsePlugin,
    stimulus: DEBRIEF,
    choices: ["Continue"],
  };

  let send_data = {
    type: CallFunctionPlugin,
    async: true,
    func: function (done) {
      proliferate.submit({ trials: jsPsych.data.get().values() });
    },
  };

  let trial = {
    type: MazePlugin,
    correct: jsPsych.timelineVariable("correct"),
    distractor: jsPsych.timelineVariable("distractor"),
    css_classes: ["maze-display"],
    prompt: function () {
      return format_header(done, trials);
    },
    data: {
      sentence: jsPsych.timelineVariable("correct"),
      type: jsPsych.timelineVariable("type"),
      item: jsPsych.timelineVariable("item"),
    },
  };

  let practice = {
    type: MazePlugin,
    correct:
      "This is a practice sentence that you are reading one word at a time.",
    distractor:
      "x-x-x whom knew appeared emotions know dad lake edition jack fans fund grow died.",
    css_classes: ["maze-display"],
    prompt: function () {
      return "<p>Practice</p><p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>";
    },
  };
  let spacer = {
    type: HtmlButtonResponsePlugin,
    stimulus: "",
    choices: [],
    trial_duration: 1000,
    on_finish: function () {
      done++;
    },
  };

  function getTimeline() {
    //////////////// timeline /////////////////////////////////
    let timeline = [];

    //timeline.push(preload);

    //timeline.push(consent);
    timeline.push(instructions);
    timeline.push(practice);
    timeline.push(instructions2);
    for (let i = 0; i < select_stimuli.length; i++) {
      let mini_timeline = {
        timeline: [trial],
        timeline_variables: select_stimuli[i],
      };
      timeline.push(mini_timeline);
      timeline.push(spacer);
    }
    //timeline.push(post_test_questions);
    timeline.push(end_experiment);
    //timeline.push(send_data);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
