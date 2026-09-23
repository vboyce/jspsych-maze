/**
 * jsPsych plugin for the Maze task.
 *
 * On each step the participant sees two words side by side, the next word of
 * the sentence and a distractor, and picks the word that continues the
 * sentence with a left key (default "e") or a right key (default "i").
 *
 * Mistakes: with redo=true the participant sees error_message for `delay` ms,
 * then redo_message, and must pick the correct word before moving on. With
 * redo=false the trial ends at the first mistake.
 *
 * Data recorded:
 *   rt          ms to the first press on each word reached
 *   correct     1 if the first press on each word reached was correct, else 0
 *   cumrt       ms from each word appearing to the correct press, including
 *               any error delay and error_guard time. When a redo=false trial
 *               ends on a mistake, that word's entry is null (the correct word
 *               was never chosen).
 *   words       the whole sentence, split into words (or groups)
 *   distractors the distractors, split the same way
 *   order       0 = correct word on the left, 1 = on the right, for every position
 * rt, correct and cumrt always have the same length; with redo=false they stop
 * at the mistake that ends the trial.
 */
import { ParameterType } from "jspsych";
import {
  groupText,
} from "./maze_helper.js";

const info = {
  name: "maze",
  parameters: {
    correct: {
      type: ParameterType.STRING,
      pretty_name: "Correct sentence",
      default: undefined,
      description: "The sentence, as a string of space-separated words (or groups; see grouping_string).",
    },
    distractor: {
      type: ParameterType.STRING,
      pretty_name: "Distractor sentence",
      default: undefined,
      description:
        "Distractors, one per word of `correct` and split the same way. The first is usually x-x-x.",
    },
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: undefined,
      description: "HTML shown in the status area above the words (required; use \"\" for none).",
    },
    order: {
      type: ParameterType.ARRAY,
      pretty_name: "Order",
      default: null,
      description:
        "Array of 0/1, one per word: 0 puts the correct word on the left, 1 on the right. " +
        "If null, each position is random.",
    },
    redo: {
      type: ParameterType.BOOL,
      pretty_name: "Redo",
      default: true,
      description: "Whether to allow retrying after a wrong answer",
    },
    delay: {
      type: ParameterType.FLOAT,
      pretty_name: "Delay",
      default: 500,
      description:
        "ms to show error_message after a mistake before keypresses register again (redo mode). " +
        "Counted in cumrt. If null, go straight to redo_message.",
    },
    normal_message: {
      type: ParameterType.STRING,
      pretty_name: "Normal message",
      default: "",
      description: "HTML shown in the feedback area below the words while there's no mistake.",
    },
    error_message: {
      type: ParameterType.STRING,
      pretty_name: "Error message",
      default: "<p>Oops! Just a second...</p>",
      description: "HTML shown in the feedback area during the post-mistake delay.",
    },
    redo_message: {
      type: ParameterType.STRING,
      pretty_name: "Redo message",
      default: "<p>Try again!</p>",
      description: "HTML shown in the feedback area once keypresses register again after a mistake.",
    },
    on_word_wrong: {
      type: ParameterType.FUNCTION,
      pretty_name: "On word wrong",
      default: null,
      description:
        "Called on each wrong selection with {wordIndex, wordsSelected}. " +
        "Return HTML to replace the redo message, or null/undefined to use the default.",
    },
    error_guard: {
      type: ParameterType.INT,
      pretty_name: "Error guard",
      default: 150,
      description:
        "Extra ms after the error delay before keypresses register again, so a held-down " +
        "key is released before the next listener starts. Counted in cumrt.",
    },
    choice_left: {
      type: ParameterType.KEYCODE,
      pretty_name: "Choice Left",
      default: ["e"],
      description: "The keys that select the left-side word.",
    },
    choice_right: {
      type: ParameterType.KEYCODE,
      pretty_name: "Choice Right",
      default: ["i"],
      description: "The keys that select the right-side word.",
    },
    background_color: {
      type: ParameterType.STRING,
      pretty_name: "Background color",
      default: "rgb(255,255,255)",
      description: 'Background color, e.g. "rgb(230,230,230)" or "gray"',
    },
    font_color: {
      type: ParameterType.STRING,
      pretty_name: "Font color",
      default: "rgb(0,0,0)",
      description: 'Text color, e.g. "rgb(0,0,0)"',
    },
    font_family: {
      type: ParameterType.STRING,
      pretty_name: "Font family",
      default: "Times New Roman",
      description: "Font family for word display",
    },
    font_size: {
      type: ParameterType.INT,
      pretty_name: "Font size",
      default: 60,
      description: "Base font size in pixels (auto-scaled down for long words)",
    },
    width: {
      type: ParameterType.INT,
      pretty_name: "Width",
      default: 1000,
      description: "Width of the word display container in pixels; also controls gap between words.",
    },
    height: {
      type: ParameterType.INT,
      pretty_name: "Height",
      default: 100,
      description: "Height of the word display container in pixels.",
    },
    grouping_string: {
      type: ParameterType.STRING,
      pretty_name: "Grouping string",
      default: null,
      description:
        "Regex pattern to split stimulus into multi-word groups. If null, splits on whitespace.",
    },
    on_word_correct: {
      type: ParameterType.FUNCTION,
      pretty_name: "On word correct",
      default: null,
      description:
        "Called after each correct word selection with {wordIndex, wordsSelected}. " +
        "Return HTML to replace the status area, or null/undefined to leave it unchanged.",
    },
    show_key_labels: {
      type: ParameterType.BOOL,
      pretty_name: "Show key labels",
      default: false,
      description:
        "When true, shows key badges (the first choice_left / choice_right key) below the word choices.",
    },
  },
};

function createTextArea(display_element) {
  let div = document.createElement("div");
  display_element.appendChild(div);
  div.style.display = "flex";
  div.style.justifyContent = "center";
  div.style.alignItems = "center";
  div.id = "feedback";
  return div;
}

function createKeyLabels(display_element, trial_pars) {
  const bar = document.createElement("div");
  bar.style.display = "flex";
  bar.style.width = `min(${trial_pars.width}px, 100%)`;
  bar.style.gap = "10%";
  bar.style.margin = "6px auto 0";

  function badge(letter, align) {
    const cell = document.createElement("div");
    cell.style.flex = "1";
    cell.style.textAlign = align;
    cell.style.fontSize = "32px";
    cell.style.fontFamily = "sans-serif";
    cell.style.color = "#444";
    cell.innerHTML =
      `<kbd style="border:1px solid #bbb;border-radius:6px;` +
      `padding:4px 14px;background:#f5f5f5;box-shadow:0 2px 0 #ccc">${letter}</kbd>`;
    return cell;
  }

  bar.appendChild(badge(trial_pars.choice_left[0].toUpperCase(), "right"));
  bar.appendChild(badge(trial_pars.choice_right[0].toUpperCase(), "left"));
  display_element.appendChild(bar);
}

function createWordDisplay(display_element, trial_pars) {
  let container = document.createElement("div");
  container.id = "maze-word-container";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.gap = "10%";
  container.style.fontFamily = trial_pars.font_family;
  container.style.fontSize = trial_pars.font_size + "px";
  container.style.color = trial_pars.font_color;
  container.style.backgroundColor = trial_pars.background_color;
  container.style.width = `min(${trial_pars.width}px, 100%)`;
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
  // Return element references so callers don't need to query by id.
  return { leftWordEl: leftWord, rightWordEl: rightWord };
}

class MazePlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial_pars) {
    // --- all mutable state is local to this trial invocation ---
    let group_index = 0;
    let first = true;
    let reactiontimes = [];
    let cumulative_rts = [];
    let cumulative_rt = 0;
    let responses = [];

    const old_html = display_element.innerHTML;
    const font_size = trial_pars.font_size;
    const valid_keys = trial_pars.choice_left.concat(trial_pars.choice_right);
    const left_keys = trial_pars.choice_left;
    const right_keys = trial_pars.choice_right;
    const error_message = trial_pars.error_message;
    const redo_message = trial_pars.redo_message;
    const normal_message = trial_pars.normal_message;
    const redo = trial_pars.redo;
    const delay = trial_pars.delay;
    const error_guard = trial_pars.error_guard;

    if (trial_pars.correct == null) throw new Error("MazePlugin: 'correct' is null — has the distractor generator been run?");
    if (trial_pars.distractor == null) throw new Error("MazePlugin: 'distractor' is null — has the distractor generator been run?");
    const correct = groupText(trial_pars.correct, trial_pars.grouping_string);
    const distractor = groupText(trial_pars.distractor, trial_pars.grouping_string);
    console.assert(
      correct.length === distractor.length,
      "Correct and distractor do not have the same length"
    );

    let order;
    if (trial_pars.order === null) {
      order = correct.map(() => Math.round(Math.random()));
    } else {
      order = trial_pars.order;
    }
    console.assert(
      correct.length === order.length,
      "Order is not the same length as correct and distractor"
    );

    // --- setup display ---
    display_element.innerHTML = "<div id='status'>" + trial_pars.prompt + "</div>";
    const { leftWordEl, rightWordEl } = createWordDisplay(display_element, trial_pars);
    if (trial_pars.show_key_labels) createKeyLabels(display_element, trial_pars);
    const feedbackDiv = createTextArea(display_element);
    feedbackDiv.innerHTML = normal_message;

    // --- helpers that close over local state ---
    function scaledFontSize(word) {
      if (word.length > 12) {
        return Math.floor(font_size * 12 / word.length) + "px";
      }
      return font_size + "px";
    }

    function drawStimulus(idx) {
      let leftWord, rightWord;
      if (order[idx] === 0) {
        leftWord = correct[idx];
        rightWord = distractor[idx];
      } else {
        leftWord = distractor[idx];
        rightWord = correct[idx];
      }
      leftWordEl.textContent = leftWord;
      leftWordEl.style.fontSize = scaledFontSize(leftWord);
      rightWordEl.textContent = rightWord;
      rightWordEl.style.fontSize = scaledFontSize(rightWord);
    }

    const trial_data = {
      rt: [],
      cumrt: [],
      correct: [],
      words: [],
      distractors: [],
      order: [],
    };

    const end_trial = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      display_element.innerHTML = old_html;
      trial_data.rt = reactiontimes;
      trial_data.cumrt = cumulative_rts;
      trial_data.correct = responses;
      trial_data.words = correct;
      trial_data.distractors = distractor;
      trial_data.order = order;
      this.jsPsych.finishTrial(trial_data);
    };

    const installResponse = () => {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: afterResponse,
        valid_responses: valid_keys,
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    };

    let currentRedoMsg = redo_message;

    const handleMistake = () => {
      const div = display_element.querySelector("#feedback");
      div.innerHTML = currentRedoMsg;
      // Short gap lets a held-down key be released before the listener activates.
      cumulative_rt += error_guard;
      this.jsPsych.pluginAPI.setTimeout(installResponse, error_guard);
    };

    const afterResponse = (info) => {
      function mapKey(letter) {
        if (left_keys.includes(letter)) return 0;
        if (right_keys.includes(letter)) return 1;
      }

      const selection = mapKey(info.key);
      if (first) {
        reactiontimes.push(info.rt);
        responses.push(order[group_index] === selection ? 1 : 0);
      }
      cumulative_rt += info.rt;

      if (order[group_index] === selection) {
        cumulative_rts.push(cumulative_rt);
        const completedIndex = group_index;
        group_index++;
        cumulative_rt = 0;
        first = true;
        if (typeof trial_pars.on_word_correct === "function") {
          const newHtml = trial_pars.on_word_correct({
            wordIndex: completedIndex,
            wordsSelected: correct.slice(0, group_index),
          });
          if (newHtml != null) {
            display_element.querySelector("#status").innerHTML = newHtml;
          }
        }
        if (group_index >= order.length) {
          end_trial();
        } else {
          const div = display_element.querySelector("#feedback");
          div.innerHTML = normal_message;
          installResponse();
          drawStimulus(group_index);
        }
      } else {
        first = false;
        currentRedoMsg = redo_message;
        if (typeof trial_pars.on_word_wrong === "function") {
          const newHtml = trial_pars.on_word_wrong({
            wordIndex: group_index,
            wordsSelected: correct.slice(0, group_index),
          });
          if (newHtml != null) currentRedoMsg = newHtml;
        }
        if (redo === false) {
          // The correct word was never chosen, so there is no time-to-correct.
          // null keeps cumrt the same length as rt and correct.
          cumulative_rts.push(null);
          end_trial();
        } else {
          if (delay === null) {
            handleMistake();
          } else {
            cumulative_rt += delay;
            const div = display_element.querySelector("#feedback");
            div.innerHTML = error_message;
            this.jsPsych.pluginAPI.setTimeout(handleMistake, delay);
          }
        }
      }
    };

    installResponse();
    drawStimulus(group_index);
  }
}

export default MazePlugin;
