/**
 * @title Maze demo: kid-friendly reading
 * @description A kid-friendly Maze task (ages 8-12): guided practice, two short passages with pictures, a progress bar, and pause/stop buttons.
 * @version 1.0.0
 *
 * @assets assets/images/kid/
 */

// Based on kid-maze-passages expt-1 (https://github.com/vboyce/kid-maze-passages),
// minus the consent/assent pages, exit survey and CHS-specific setup. Data isn't
// saved anywhere.
//
// The kid styling lives in styles/kid.scss and only applies under
// <body class="kid-maze">, which this file adds, so the other demos are unaffected.

import "../styles/main.scss";
import { initJsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import PreloadPlugin from "@jspsych/plugin-preload";

import { shuffle, capitalize } from "./helper.js";
import { passages, PRACTICE_SENTENCES, PRACTICE_IMAGES, PASSAGE_IMAGES, THANKS_IMAGE } from "./kid/stimuli.js";
import { INSTRUCTIONS, INSTRUCTION_IMAGES, preStoriesHtml, betweenPassagesHtml } from "./kid/instructions.js";
import { buildPassageTimeline, buildPracticeTimeline } from "./kid/timeline.js";
import { createPauseButton, createStopButton, applyStopGuard } from "./kid/controls.js";
import {
  createProgressBar,
  setSection,
  setSectionProgress,
  setSectionLabel,
  progressFraction,
  withSectionProgress,
} from "./kid/progress.js";

export async function run() {
  document.body.classList.add("kid-maze");
  createProgressBar();

  // Give jsPsych its own container: jsPsych clears its display element on init,
  // which would remove the progress bar if jsPsych used document.body.
  const jsPsychContainer = document.createElement("div");
  document.body.appendChild(jsPsychContainer);

  const jsPsych = initJsPsych({ display_element: jsPsychContainer });

  const progressBar = document.querySelector("#progress-bar");
  const pauseControl = createPauseButton(jsPsych, progressBar);
  const stopFlag = { stopped: false };
  const stopControl = createStopButton(jsPsych, progressBar, stopFlag);

  // Everything before the thanks screen is guarded by stopFlag
  // (applyStopGuard), so "Stop study" skips straight to the thanks screen.
  const mainTimeline = [];

  mainTimeline.push({
    type: PreloadPlugin,
    images: [...INSTRUCTION_IMAGES, ...PRACTICE_IMAGES, ...PASSAGE_IMAGES, THANKS_IMAGE],
  });

  // Learn-how section: instructions and the three practice levels.
  const learnHowTrials = [
    {
      type: HtmlButtonResponsePlugin,
      stimulus: `<div class="instruction-slide">${INSTRUCTIONS}</div>`,
      choices: ["Continue"],
    },
    ...buildPracticeTimeline(PRACTICE_SENTENCES),
  ];
  mainTimeline.push(...withSectionProgress(learnHowTrials, "learn-how"));

  // The two passages, in random order.
  const orderedPassages = [...passages];
  shuffle(orderedPassages);
  setSectionLabel("story-1", capitalize(orderedPassages[0].topic));
  setSectionLabel("story-2", capitalize(orderedPassages[1].topic));

  mainTimeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `<div class="instruction-slide">${preStoriesHtml(orderedPassages[0].topic, orderedPassages[1].topic)}</div>`,
    choices: ["Let's go!"],
    on_start: () => setSection("story-1"),
  });

  for (let p = 0; p < orderedPassages.length; p++) {
    if (p > 0) {
      mainTimeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: betweenPassagesHtml(orderedPassages[p].topic),
        choices: ["Start reading!"],
        on_start: () => setSection(`story-${p + 1}`),
      });
    }
    mainTimeline.push(
      ...buildPassageTimeline(orderedPassages[p], p, orderedPassages.length, (passageNum, sentenceNum, total) =>
        setSectionProgress(`story-${passageNum}`, progressFraction(sentenceNum, total))
      )
    );
  }

  const thanksTrial = {
    type: HtmlButtonResponsePlugin,
    stimulus:
      `<h2>Thanks for reading!</h2>` +
      `<img src="${THANKS_IMAGE}" alt="Penguins celebrating"` +
      ` style="width:40%;max-height:25vh;object-fit:contain;display:block;margin:8px auto;">` +
      `<p>This is a demo, so no data was saved.</p>`,
    choices: [],
    on_start: () => {
      setSection("wrap-up");
      setSectionProgress("wrap-up", 1);
      pauseControl.hide();
      stopControl.hide();
    },
  };

  await jsPsych.run([...applyStopGuard(mainTimeline, stopFlag), thanksTrial]);
}
