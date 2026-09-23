/**
 * @title Maze demo: critical items without redo
 * @description Maze Made Easy items where a mistake ends the sentence (redo: false).
 * @version 1.0.0
 *
 * @assets assets/
 */

import "../styles/main.scss";
import MazePlugin from "./maze.js";
import { initJsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";

import { proliferate } from "./proliferate.js";
import { makeSubmitHandlers } from "./submit.js";
import { stimuli } from "./critical-stimuli.js";
import { DEBRIEF, INSTRUCTIONS_CRITICAL } from "./instructions.js";


export async function run() {
  const jsPsych = initJsPsych({
    ...makeSubmitHandlers({
      getData: () => jsPsych.data.get().values(),
      submit: (data) => proliferate.submit(data),
      sendBeacon: (url, form) => navigator.sendBeacon(url, form),
      search: window.location.search,
    }),
  });

  // Whether the last sentence was finished without a mistake.
  let last_correct;

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS_CRITICAL,
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
    redo: false,
    delay: 0,
    correct: jsPsych.timelineVariable("sent"),
    distractor: jsPsych.timelineVariable("distractor"),
    css_classes: ["maze-display"],
    prompt:
      "<p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>",
    on_finish: function (data) {
      // With redo: false the trial ends at the first mistake, so the sentence
      // was finished correctly iff every word reached was correct.
      last_correct = data.correct.length === data.words.length && !data.correct.includes(0);
    },
  };

  let spacer = {
    type: HtmlButtonResponsePlugin,
    stimulus: function () {
      if (last_correct) {
        return "<p>Great! Continuing to next sentence.</p>";
      } else {
        return '<p style="color:red;"> Wrong!</p><p>Continuing to next sentence.</p>';
      }
    },
    choices: [],
    trial_duration: 1000,
  };

  function getTimeline() {
    //////////////// timeline /////////////////////////////////
    let timeline = [];
    timeline.push(instructions);
    let mini_timeline = {
      timeline: [trial, spacer],
      timeline_variables: stimuli,
    };
    timeline.push(mini_timeline);
    timeline.push(end_experiment);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
