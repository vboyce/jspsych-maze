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

import { stimuli } from "./ns-maze-stimuli.js";
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
  INSTRUCTIONS_NS,
  INSTRUCTIONS2,
} from "./instructions.js";
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych({
    on_close: function () {
      var data = jsPsych.data.get().values();
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

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS_NS,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let end_experiment = {
    type: HtmlButtonResponsePlugin,
    stimulus: DEBRIEF,
    choices: ["Continue"],
  };

  let trial = {
    type: MazePlugin,
    correct: jsPsych.timelineVariable("sent"),
    distractor: jsPsych.timelineVariable("distractor"),
    css_classes: ["maze-display"],
    prompt:
      "<p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>",
  };

  function getTimeline() {
    //////////////// timeline /////////////////////////////////
    let timeline = [];
    timeline.push(instructions);
    let mini_timeline = {
      timeline: [trial],
      timeline_variables: stimuli,
    };
    timeline.push(mini_timeline);
    timeline.push(end_experiment);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
