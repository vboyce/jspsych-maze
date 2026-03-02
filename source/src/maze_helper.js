import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const CAP_WHITE_SPACE = "(\\s)";

const RE_CAP_WHITE_SPACE = RegExp(CAP_WHITE_SPACE, "u");

/**
 * Creates a range between [start, end).
 *
 * @param start The value at which the range starts
 * @param end   The value before which the range stops.
 *
 * @return an array with the range.
 */
export function range(start, end, step = 1) {
  let a = [];
  if (step > 0) {
    for (let i = start; i < end; i++) a.push(i);
  } else if (step < 0) {
    for (let i = start; i > end; i++) a.push(i);
  } else {
    throw RangeError("Argument 3 (the step) must be larger or smaller than 0.");
  }
  return a;
}

/**
 * Class to represent the position of a word on a 2d canvas
 */
export class Pos {
  /**
   * @param {number} x the x position of a word
   * @param {number} y the y position of a word
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Class to contain some data about a word, on how to present it
 * on a canvas.
 */
export class TextInfo {
  /**
   * @param {string} txt, the text to draw at ctx
   * @param {Pos} position the position at which to draw text.
   * @param {} ctx the 2d drawing position.
   */
  constructor(text, position, ctx, record = false) {
    if (typeof text !== "string")
      console.error("TextInfo constructor text was not a String");
    if (typeof record !== "boolean")
      console.error("TextInfo constructor positions was not a Pos");
    this.text = text;
    this.pos = position;
    this.ctx = ctx;
    this.metrics = ctx.measureText(this.text);
  }

  drawText() {
    this.ctx.fillText(this.text, this.pos.x, this.pos.y);
  }

  width() {
    return this.metrics.width;
  }
}

/**
 * Splits text into tokens and discards empty strings. The
 * tokens are defined by the regular expression used to
 * split the string.
 *
 * @param {String} text The text to splint into tokens
 * @param {RegExp} re   The regular expression used to split the string
 *
 * @return An array of strings as tokens.
 */
export function createGroups(text, re) {
  return text.split(re).filter(function (word) {
    return word != "";
  });
}

/**
 * Takes a text and grouping string, splits it on that
 * returns the list of groups (usually words)
 * but other groupingStrings will allow for other splits.
 */
export function groupText(text, groupingString) {
  let stimulus = text;
  let groups;
  if (groupingString) {
    let grouping_re = RegExp(groupingString, "ug");
    groups = createGroups(stimulus, grouping_re);
  } else {
    groups = createGroups(stimulus, RegExp("\\s", "u"));
  }
  return groups;
}
/**
 * Class to obtain useful information about words
 * that should be presented in a group
 */
export class GroupInfo {
  /**
   * @param indices {Array.<number>} Indices of the words to be
   *                                 presented in this group
   * @param record {bool}            A boolean whether or not
   *                                 the rt of this group
   *                                 should be recorded.
   */
  constructor(indices, text) {
    this.indices = indices;
    this.text = text.join(" ");
  }
}

/**
 * Determines the expected height of a line, that is: how much should
 * y advance for each line in a text field.
 *
 * It's a hack, but is seems to work. TextMetrics should - in my
 * opinion - support this.
 *
 * Borrowed and adapted from:
 * https://stackoverflow.com/questions/11452022/measure-text-height-on-an-html5-canvas-element/19547748
 */
export function determineLineHeight(font, font_size) {
  let text = "Hello World";

  let div = document.createElement("div");
  div.innerHTML = text;
  div.style.position = "absolute";
  div.style.top = "-9999px";
  div.style.left = "-9999px";
  div.style.fontFamily = font;
  div.style.fontSize = font_size + "pt"; // or 'px'
  document.body.appendChild(div);
  let height = div.offsetHeight;
  document.body.removeChild(div);
  return height;
}

export function gatherWordInfo(correct, distractor, trial_pars, ctx, order) {
  let distractor_words = [];
  let correct_words = [];
  let delta_y = determineLineHeight(
    trial_pars.font_family,
    trial_pars.font_size
  );
  let word = 0;
  let center = trial_pars.width * 0.5;
  let padding = trial_pars.width * 0.1;
  const BASE_Y = delta_y * 1.5; // The height on which lines begin.
  let correct_text = null;
  let distractor_text = null;
  let correct_pos = null;
  let distractor_pos = null;

  for (let i = 0; i < correct.length; i++) {
    correct_text = correct[i];
    distractor_text = distractor[i];
    if (order[i] == 0) {
      correct_pos = new Pos(
        center - padding - ctx.measureText(correct_text).width,
        BASE_Y
      );
      distractor_pos = new Pos(center + padding, BASE_Y);
    } else {
      correct_pos = new Pos(center + padding, BASE_Y);
      distractor_pos = new Pos(
        center - padding - ctx.measureText(distractor_text).width,
        BASE_Y
      );
    }
    let correct_word = new TextInfo(correct_text, correct_pos, ctx);
    correct_words.push(correct_word);
    let distractor_word = new TextInfo(distractor_text, distractor_pos, ctx);
    distractor_words.push(distractor_word);
  }
  return [correct_words, distractor_words];
}
