# jspsych-maze

A [jsPsych](https://www.jspsych.org/) (v7) plugin for the **Maze task**, plus the demo experiments that use it.

In the Maze task, participants read a sentence one word at a time. At each step they see two words side by side: the next word of the sentence and a distractor. They choose the word that continues the sentence by pressing a left key (`e`) or a right key (`i`). Response times show which words were hard to process. Distractors can be generated automatically with [maze-distractor-generator](https://github.com/vboyce/maze-distractor-generator).

- **Documentation:** https://vboyce.github.io/maze-docs
- **Live demos:** https://vboyce.github.io/maze-demos

## Layout

```
source/
  src/maze.js              the plugin
  src/maze_helper.js       splits a sentence into words (or custom groups)
  src/*-experiment.js      one entry point per demo (see "Demos")
  src/*-stimuli.js         stimuli for each demo
  src/kid/                 modules for the kid-friendly demo (timeline, progress bar, pause/stop)
  src/submit.js            submit-once data handlers for Proliferate
  src/__tests__/, src/kid/__tests__/   vitest tests
  styles/main.scss         shared styles; styles/kid.scss is the kid-friendly theme
  assets/                  images (copied into each build)
```

## Setup

Needs Node.js (18 or later) and npm.

```sh
cd source
npm install
npm test                    # run the test suite (vitest)
npm run start:kid-maze      # serve a demo locally with live reload
npm run build:kid-maze      # build a demo into packaged/<demo>-experiment_<version>.zip
```

There are `start:<demo>` and `build:<demo>` scripts for each demo: `as-maze`, `critical`, `moderate`, `ns-maze` and `kid-maze`. They use [jspsych-builder](https://github.com/bjoluc/jspsych-builder).

## Using the plugin

Copy `src/maze.js` and `src/maze_helper.js` into your experiment, then:

```js
import MazePlugin from "./maze.js";

const trial = {
  type: MazePlugin,
  correct: "The cat sat on the mat.",
  distractor: "x-x-x ends lady sum hid pro.",
  prompt: "<p>Press <b>e</b> for the left word, <b>i</b> for the right word.</p>",
};
```

`correct` and `distractor` must split into the same number of words. The first distractor is usually `x-x-x`, since the first word has no context to make a distractor bad. If you have many items, use `jsPsych.timelineVariable("sent")` and `jsPsych.timelineVariable("distractor")`. maze-distractor-generator's JSON output uses these key names.

### Parameters

| Parameter | Default | Description |
|---|---|---|
| `correct` | *required* | The sentence, as space-separated words (or groups; see `grouping_string`). |
| `distractor` | *required* | One distractor per word of `correct`, split the same way. |
| `prompt` | *required* | HTML shown above the words. Use `""` for none. |
| `order` | `null` | Array of 0/1, one per word: 0 puts the correct word on the left, 1 on the right. `null` randomizes each position. |
| `redo` | `true` | If true, a mistake shows an error message and the participant must then pick the correct word. If false, the trial ends at the first mistake. |
| `delay` | `500` | ms to show `error_message` after a mistake before keys work again (redo mode). `null` skips straight to `redo_message`. |
| `error_guard` | `150` | Extra ms after the delay before keys work again, so a held-down key is released first. |
| `error_message` | `"<p>Oops! Just a second...</p>"` | HTML shown during the delay after a mistake. |
| `redo_message` | `"<p>Try again!</p>"` | HTML shown once keys work again after a mistake. |
| `normal_message` | `""` | HTML shown below the words when there's no mistake. |
| `on_word_correct` | `null` | `({wordIndex, wordsSelected}) => html`, called after each correct choice. Returned HTML replaces the prompt area; return `null` to leave it. |
| `on_word_wrong` | `null` | `({wordIndex, wordsSelected}) => html`, called after each wrong choice. Returned HTML replaces `redo_message` for that mistake. |
| `show_key_labels` | `false` | Show key badges (the first `choice_left` / `choice_right` key) under the two words. |
| `choice_left` / `choice_right` | `["e"]` / `["i"]` | Keys that select the left / right word. |
| `font_family`, `font_size`, `font_color`, `background_color` | Times New Roman, 60, black, white | Word display. Words over 12 characters are shrunk to fit. |
| `width`, `height` | `1000`, `100` | Size of the word display in px. The width shrinks on narrow screens. |
| `grouping_string` | `null` | Regex to split the sentence into multi-word groups instead of words. |

The display uses these element ids, so you can style them with CSS: `#status` (the prompt), `#maze-word-container`, `#maze-left-word`, `#maze-right-word` and `#feedback`.

### Data

Each maze trial records:

| Field | Contents |
|---|---|
| `rt` | ms to the first key press on each word reached. |
| `correct` | 1 if that first press was correct, else 0. |
| `cumrt` | ms from each word appearing to the correct press. This includes time spent on wrong presses, the error `delay` and `error_guard`. Only words answered correctly get an entry, so when a `redo: false` trial ends on a mistake, `cumrt` is one shorter than `rt`. |
| `words`, `distractors` | The sentence and distractors, split into words. |
| `order` | 0 or 1 for each position (0 = correct word on the left). |

With `redo: true` every trial runs to the end of the sentence, so `rt`, `correct` and `cumrt` all have one entry per word. With `redo: false`, they stop at the first mistake. Add your own fields (item id, condition) with jsPsych's `data` parameter.

## Demos

| Demo | Entry point | What it shows |
|---|---|---|
| `kid-maze` | `kid-maze-experiment.js` | A kid-friendly version (ages 8–12). It has guided practice with tips (`on_word_correct` / `on_word_wrong`), key badges, two short passages with pictures, a progress bar, pause/stop buttons, and a CSS theme scoped under `body.kid-maze` (`styles/kid.scss`). It is based on [kid-maze-passages](https://github.com/vboyce/kid-maze-passages) experiment 1, without the consent pages and exit survey. |
| `moderate` | `moderate-experiment.js` | Counterbalanced relative-clause and adverb attachment sentences, ending with a graph of your own RTs. |
| `critical` | `critical-experiment.js` | Items from Maze Made Easy (Boyce, Futrell & Levy, 2020) with `redo: false`, plus a "Great!" / "Wrong!" screen between sentences. |
| `as-maze` | `as-maze-experiment.js` | Multi-sentence vignettes from Altmann & Steedman (1988), with balanced conditions (`helper.js` `subset`). |
| `ns-maze` | `ns-maze-experiment.js` | A Natural Stories passage, read sentence by sentence. |

The demos don't save data. `submit.js` posts data to [Proliferate](https://proliferate.alps.science) only when the page has Proliferate's `experiment_id` and `participant_id` URL parameters. Without them, `proliferate.js` shows the data it would have submitted.

### Updating the live demos

The live demos are the built files in [maze-demos](https://github.com/vboyce/maze-demos) `deploy/`. To update one:

```sh
cd source
npm run build:critical
unzip -o packaged/critical-experiment_1.0.0.zip -d ../../maze-demos/deploy/
```

Then commit and push maze-demos. Its GitHub Pages workflow publishes `deploy/`.

## Styling for children

See `styles/kid.scss` and the [kid-friendly page of the docs](https://vboyce.github.io/maze-docs/kid-friendly.html).

## Citing

If you use the Maze task with automatically generated distractors, please cite: V. Boyce, R. Futrell, R. P. Levy (2020). Maze Made Easy: Better and easier measurement of incremental processing difficulty. *Journal of Memory and Language*.
