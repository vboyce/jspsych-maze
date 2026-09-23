/**
 * @title Maze demo: attachment ambiguities with an RT graph
 * @description Counterbalanced relative-clause and adverb attachment items, then a graph of the participant's own RTs.
 * @version 1.0.0
 *
 * @assets assets/
 */

import "../styles/main.scss";
import MazePlugin from "./maze.js";
import { initJsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";

import { counterbalance } from "./helper.js";
import { stimuli } from "./moderate-stimuli.js";
import { INSTRUCTIONS_CRITICAL } from "./instructions.js";
import { graph1, graph2 } from "./graph.js";


// Each participant sees every item once, split evenly between its high and
// low attachment versions.
const select_stimuli = counterbalance(
  [
    ["adverb_high", "adverb_low"],
    ["relative_high", "relative_low"],
  ],
  stimuli
);

// Data isn't submitted anywhere: the demo ends on a graph of the participant's
// own reaction times.
export async function run() {
  const jsPsych = initJsPsych();

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS_CRITICAL,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let graph_page = {
    type: HtmlButtonResponsePlugin,
    stimulus: `<div>
    <p><b>Here are your reaction times. Any errors are marked with a <span style="color:red">red x</span>.</b></p>
      <p> You saw 4 sentences, 2 with relative clauses and 2 with temporal adverbs. 
      In both cases, there is a temporary syntactic ambiguity about where the clause or adverb attaches, and 
      <span style="color: rgb(50, 150, 40)">the lower (local) attachment</span> is usually faster to parse than <span style="color: rgb(221, 79, 126)">the higher (non-local) attachment</span>. </p></div>
<div style="display: flex; flex-direction: column; gap: 20px; align-items: center; width: 100%;">
  <p style="max-width: 1200px;">The first type of sentences had <b>relative clauses</b>. The reflexive pronoun disambiguates whether the RC modifies <span style="color: rgb(50, 150, 40)">the prepositional object (low) </span> or <span style="color: rgb(221, 79, 126)"> the main subject (high)</span>.</p>
  <p style="max-width: 1200px;"> The sister of the boy who taught [ <span style="color: rgb(50, 150, 40)">himself</span> | <span style="color: rgb(221, 79, 126)">herself</span> ] advanced mathematics was very smart.</br>
 The brother of the bride who embarassed [ <span style="color: rgb(50, 150, 40)">herself</span> | <span style="color: rgb(221, 79, 126)">himself</span> ] at the wedding felt ashamed. </p>
  <div style="width: 100%; max-width: 1200px; height: 400px;">    <canvas id="chart1" style="height: 400px;
  width: 1200px;"></canvas>
  </div>  
    <p style="max-width: 1200px;"> The other type of sentences had <b>temporal adverbs</b> that can modify <span style="color: rgb(50, 150, 40)">the local relative clause verb (low) </span> or <span style="color: rgb(221, 79, 126)"> the main verb (high)</span>. </p>
 <p style="max-width: 1200px;"> David caught the fish he will cook [ <span style="color: rgb(50, 150, 40)">tomorrow,</span> | <span style="color: rgb(221, 79, 126)">yesterday,</span> ] but it is not his favorite kind.
</br>
   Anne will serve the apples she picked [ <span style="color: rgb(50, 150, 40)">yesterday,</span> | <span style="color: rgb(221, 79, 126)">tomorrow,</span> ] but she won't serve the plums.
 </p>
    <div style="width: 100%; max-width: 1200px; height: 400px;">
      <canvas id="chart2" style="height: 400px;
  width: 1200px;"></canvas>
  </div>
      `,
    on_load: function () {
      const ctx1 = document.getElementById("chart1").getContext("2d");
      const ctx2 = document.getElementById("chart2").getContext("2d");
      const data = jsPsych.data.get().values();
      graph1(ctx1, data);
      graph2(ctx2, data);
    },
    choices: [],
  };

  let trial = {
    type: MazePlugin,
    correct: jsPsych.timelineVariable("sent"),
    distractor: jsPsych.timelineVariable("distractor"),
    css_classes: ["maze-display"],
    prompt:
      "<p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>",
    data: {
      sentence: jsPsych.timelineVariable("sent"),
      type: jsPsych.timelineVariable("item_type"),
      item: jsPsych.timelineVariable("id"),
    },
  };

  let spacer = {
    type: HtmlButtonResponsePlugin,
    stimulus: "",
    choices: [],
    trial_duration: 1000,
  };

  function getTimeline() {
    //////////////// timeline /////////////////////////////////
    let timeline = [];
    timeline.push(instructions);
    let mini_timeline = {
      timeline: [trial, spacer],
      timeline_variables: select_stimuli,
    };
    timeline.push(mini_timeline);
    timeline.push(graph_page);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
