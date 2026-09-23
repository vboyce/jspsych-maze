/**
 * @title Maze demo: Natural Stories passage
 * @description One Natural Stories passage, read sentence by sentence (redo mode).
 * @version 1.0.0
 */

import "../styles/main.scss";
import MazePlugin from "./maze.js";
import { initJsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";

import { proliferate } from "./proliferate.js";
import { makeSubmitHandlers } from "./submit.js";
import { stimuli } from "./ns-maze-stimuli.js";
import { DEBRIEF, INSTRUCTIONS_NS } from "./instructions.js";


export async function run() {
  const jsPsych = initJsPsych({
    ...makeSubmitHandlers({
      getData: () => jsPsych.data.get().values(),
      submit: (data) => proliferate.submit(data),
      sendBeacon: (url, form) => navigator.sendBeacon(url, form),
      search: window.location.search,
    }),
  });

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
