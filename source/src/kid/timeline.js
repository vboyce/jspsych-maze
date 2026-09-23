import MazePlugin from "../maze.js";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { ERROR_MESSAGE, REDO_MESSAGE, REDO_MESSAGE_PRACTICE } from "./instructions.js";

import { kidImage } from "./images.js";

// Timelines for the kid-friendly demo: the guided practice levels and the
// passages, with an image screen after any sentence that has an image.

function imageTrial(img, credit, aboveText = null) {
  return {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      (aboveText ? `<h2>${aboveText}</h2>` : "") +
      `<img src="${kidImage(img)}" alt=""` +
      ` style="width:75%;max-height:55vh;object-fit:contain;display:block;margin:0 auto;">` +
      `<p class="img-credit">${credit ?? ""}</p>` +
      `<p class="continue-hint">Press spacebar to continue</p>`,
    choices: [" "],
  };
}

export function buildPassageTimeline(passage, passageIndex, numPassages, onProgress) {
  const items = [];
  const passageNum = passageIndex + 1;
  const totalSentences = passage.sentences.length;

  for (let s = 0; s < passage.sentences.length; s++) {
    const sent = passage.sentences[s];
    items.push({
      type: MazePlugin,
      correct: sent.sent,
      distractor: sent.distractor,
      prompt: "",
      error_message: ERROR_MESSAGE,
      redo_message: REDO_MESSAGE,
      show_key_labels: true,
      data: { passage: passageNum, sentence: sent.num },
      on_finish: () => {
        if (onProgress) onProgress(passageNum, sent.num, totalSentences);
      },
    });

    if (sent.img != null) {
      items.push(imageTrial(sent.img, sent.credit));
    }
  }

  return items;
}

export function buildPracticeTimeline(practiceSentences) {
  const items = [];

  for (const sent of practiceSentences) {
    items.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `<div class="instruction-slide">${sent.instruction}</div>`,
      choices: ["Try it!"],
      button_html: ['<button class="jspsych-btn">%choice%</button>'],
    });

    const mazeItem = {
      type: MazePlugin,
      correct: sent.sent,
      distractor: sent.distractor,
      order: sent.order ?? null,
      prompt: sent.level === 1 ? `<p>${sent.word_tips[0]}</p>` : "",
      error_message: ERROR_MESSAGE,
      redo_message: sent.level === 3 ? REDO_MESSAGE : REDO_MESSAGE_PRACTICE,
      show_key_labels: true,
    };

    if (sent.level === 1) {
      mazeItem.on_word_correct = ({ wordIndex, wordsSelected }) => {
        const sentSoFar = wordsSelected.join(" ");
        const tip = sent.word_tips[wordIndex + 1] ?? "";
        return `<p>${sentSoFar} →</p><p>${tip}</p>`;
      };
    } else if (sent.level === 2) {
      mazeItem.on_word_correct = ({ wordsSelected }) =>
        `<p>${wordsSelected.join(" ")} →</p>`;
    }

    items.push(mazeItem);

    if (sent.img != null) {
      items.push(imageTrial(sent.img, sent.credit, "Great job!"));
    }
  }

  return items;
}
