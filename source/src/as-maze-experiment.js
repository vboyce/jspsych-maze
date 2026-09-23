/**
 * @title Maze demo: Altmann & Steedman vignettes
 * @description Multi-sentence vignettes with a context that biases a PP attachment ambiguity (redo mode).
 * @version 1.0.0
 */

import "../styles/main.scss";
import MazePlugin from "./maze.js";
import { initJsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";

import { proliferate } from "./proliferate.js";
import { makeSubmitHandlers } from "./submit.js";
import { subset } from "./helper.js";
import { stimuli } from "./as-maze-stimuli.js";
import { format_header } from "./constants.js";
import { DEBRIEF, INSTRUCTIONS, INSTRUCTIONS2 } from "./instructions.js";


// Number of vignettes to show; conditions are balanced across them.
const NUM_ITEMS = 2;

const select_stimuli = subset(stimuli, NUM_ITEMS);
const trials = select_stimuli.length;

export async function run() {
  const jsPsych = initJsPsych({
    ...makeSubmitHandlers({
      getData: () => jsPsych.data.get().values(),
      submit: (data) => proliferate.submit(data),
      sendBeacon: (url, form) => navigator.sendBeacon(url, form),
      search: window.location.search,
    }),
  });

  // Vignettes completed so far, shown in the header ("Story 1/2").
  let done = 1;

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS,
    choices: ["Continue"],
    response_ends_trial: true,
    on_load: function () {
      if (!document.getElementById("end-experiment-btn")) {
        const endBtn = document.createElement("button");
        endBtn.id = "end-experiment-btn";
        endBtn.textContent = "End Experiment";
        endBtn.style.cssText = "position:fixed; top:10px; right:10px; z-index:10000; padding:8px 16px; cursor:pointer;";
        endBtn.addEventListener("click", () => {
          jsPsych.endExperiment("The experiment was ended early.");
        });
        document.body.appendChild(endBtn);
      }
    },
  };

  let instructions2 = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS2,
    choices: ["Continue"],
    response_ends_trial: true,
  };
  let end_experiment = {
    type: HtmlButtonResponsePlugin,
    stimulus: DEBRIEF,
    choices: ["Continue"],
    on_load: function () {
      document.getElementById("end-experiment-btn")?.remove();
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
    timeline.push(end_experiment);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
