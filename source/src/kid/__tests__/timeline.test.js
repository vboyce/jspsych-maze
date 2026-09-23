import { describe, it, expect, vi } from "vitest";
import { buildPassageTimeline, buildPracticeTimeline } from "../timeline.js";
import MazePlugin from "../../maze.js";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

// ---------------------------------------------------------------------------
// buildPassageTimeline
// ---------------------------------------------------------------------------

describe("buildPassageTimeline", () => {
  const sentWithImg = { num: 1, sent: "The cat sat.", distractor: "x-x-x dog ran.", img: "cat.jpg", credit: "CC-BY" };
  const sentNoImg   = { num: 2, sent: "A dog ran.",   distractor: "x-x-x cat sat.", img: null, credit: null };

  it("produces a maze trial for every sentence", () => {
    const passage = { title: "Test", sentences: [sentWithImg, sentNoImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    const mazeItems = items.filter(t => t.type === MazePlugin);
    expect(mazeItems).toHaveLength(2);
  });

  it("inserts an image trial after a sentence that has an image", () => {
    const passage = { title: "Test", sentences: [sentWithImg, sentNoImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    // item 0 = maze for sentWithImg, item 1 = image trial, item 2 = maze for sentNoImg
    expect(items).toHaveLength(3);
    expect(items[0].type).toBe(MazePlugin);
    expect(items[1].type).toBe(HtmlKeyboardResponsePlugin);
    expect(items[2].type).toBe(MazePlugin);
  });

  it("does not insert an image trial after a sentence without an image", () => {
    const passage = { title: "Test", sentences: [sentNoImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe(MazePlugin);
  });

  it("image trial stimulus contains the image filename", () => {
    const passage = { title: "Test", sentences: [sentWithImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    const imgTrial = items[1];
    expect(imgTrial.stimulus).toContain("cat.jpg");
  });

  it("image trial stimulus contains the credit text when present", () => {
    const passage = { title: "Test", sentences: [sentWithImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    const imgTrial = items[1];
    expect(imgTrial.stimulus).toContain("CC-BY");
  });

  it("image trial accepts spacebar to advance", () => {
    const passage = { title: "Test", sentences: [sentWithImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    const imgTrial = items[1];
    expect(imgTrial.choices).toContain(" ");
  });

  it("image trial stimulus prompts the participant to press spacebar", () => {
    const passage = { title: "Test", sentences: [sentWithImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    const imgTrial = items[1];
    expect(imgTrial.stimulus.toLowerCase()).toContain("spacebar");
  });

  it("maze trials carry passage and sentence data tags", () => {
    const passage = { title: "Test", sentences: [sentWithImg, sentNoImg] };
    const items = buildPassageTimeline(passage, 0, 2);
    const mazeItems = items.filter(t => t.type === MazePlugin);
    expect(mazeItems[0].data).toMatchObject({ passage: 1, sentence: 1 });
    expect(mazeItems[1].data).toMatchObject({ passage: 1, sentence: 2 });
  });

  it("maze trials include correct and distractor sentences", () => {
    const passage = { title: "Test", sentences: [sentWithImg] };
    const items = buildPassageTimeline(passage, 0, 1);
    expect(items[0].correct).toBe(sentWithImg.sent);
    expect(items[0].distractor).toBe(sentWithImg.distractor);
  });
});

// ---------------------------------------------------------------------------
// buildPassageTimeline — per-sentence progress reporting
// ---------------------------------------------------------------------------

describe("buildPassageTimeline — progress reporting", () => {
  const sent1 = { num: 1, sent: "The cat sat.", distractor: "x-x-x dog ran.", img: null, credit: null };
  const sent2 = { num: 2, sent: "A dog ran.", distractor: "x-x-x cat sat.", img: null, credit: null };

  it("calls onProgress with passage number, sentence number, and total sentences when a maze trial finishes", () => {
    const passage = { title: "Test", sentences: [sent1, sent2] };
    const onProgress = vi.fn();
    const items = buildPassageTimeline(passage, 0, 1, onProgress);
    const mazeItems = items.filter((t) => t.type === MazePlugin);

    mazeItems[0].on_finish();
    expect(onProgress).toHaveBeenCalledWith(1, 1, 2);

    mazeItems[1].on_finish();
    expect(onProgress).toHaveBeenCalledWith(1, 2, 2);
  });

  it("does not throw when onProgress is omitted", () => {
    const passage = { title: "Test", sentences: [sent1] };
    const items = buildPassageTimeline(passage, 0, 1);
    const maze = items.find((t) => t.type === MazePlugin);
    expect(() => maze.on_finish()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// buildPracticeTimeline
// ---------------------------------------------------------------------------

// Minimal 3-level practice fixture
const level1 = {
  level: 1,
  sent: "The cat sat.",
  distractor: "x-x-x dog ran.",
  img: "cat.jpg",
  credit: "CC-BY",
  instruction: "<p>Watch me!</p>",
  word_tips: ["Pick The!", "Pick cat!", "Pick sat!"],
};
const level2 = {
  level: 2,
  sent: "A dog ran.",
  distractor: "x-x-x cat sat.",
  img: "dog.jpg",
  credit: "CC-BY",
  instruction: "<p>Your turn!</p>",
};
const level3 = {
  level: 3,
  sent: "A bunny hopped.",
  distractor: "x-x-x cat ran.",
  img: null,
  credit: null,
  instruction: "<p>Without help!</p>",
};

describe("buildPracticeTimeline — structure", () => {
  it("produces one maze trial per practice sentence", () => {
    const items = buildPracticeTimeline([level1, level2, level3]);
    expect(items.filter(t => t.type === MazePlugin)).toHaveLength(3);
  });

  it("inserts an instruction screen before each maze trial", () => {
    const items = buildPracticeTimeline([level1]);
    expect(items[0].type).toBe(HtmlButtonResponsePlugin);
    expect(items[1].type).toBe(MazePlugin);
  });

  it("instruction screen stimulus contains the instruction text", () => {
    const items = buildPracticeTimeline([level1]);
    expect(items[0].stimulus).toContain("Watch me!");
  });

  it("inserts an image trial after the maze when img is present", () => {
    const items = buildPracticeTimeline([level1]);
    // instruction, maze, image
    expect(items).toHaveLength(3);
    expect(items[2].type).toBe(HtmlKeyboardResponsePlugin);
    expect(items[2].stimulus).toContain("cat.jpg");
  });

  it("practice image trial includes 'Great job' above the image", () => {
    const items = buildPracticeTimeline([level1]);
    const imgTrial = items[2];
    const gjPos = imgTrial.stimulus.indexOf("Great job");
    const imgPos = imgTrial.stimulus.indexOf("cat.jpg");
    expect(gjPos).toBeGreaterThanOrEqual(0);
    expect(gjPos).toBeLessThan(imgPos);
  });

  it("passage image trial does not include 'Great job'", () => {
    const passage = { title: "Test", sentences: [{ num: 1, sent: "The cat sat.", distractor: "x-x-x dog ran.", img: "cat.jpg", credit: "CC-BY" }] };
    const items = buildPassageTimeline(passage, 0, 1);
    expect(items[1].stimulus).not.toContain("Great job");
  });

  it("does not insert an image trial when img is null", () => {
    const items = buildPracticeTimeline([level3]);
    // instruction, maze (no image)
    expect(items).toHaveLength(2);
  });

  it("maze trial uses correct and distractor from the sentence", () => {
    const items = buildPracticeTimeline([level1]);
    const maze = items.find(t => t.type === MazePlugin);
    expect(maze.correct).toBe(level1.sent);
    expect(maze.distractor).toBe(level1.distractor);
  });
});

describe("buildPracticeTimeline — level callbacks", () => {
  it("level 1 maze has on_word_correct callback", () => {
    const items = buildPracticeTimeline([level1]);
    const maze = items.find(t => t.type === MazePlugin);
    expect(typeof maze.on_word_correct).toBe("function");
  });

  it("level 1 initial prompt contains the first word tip", () => {
    const items = buildPracticeTimeline([level1]);
    const maze = items.find(t => t.type === MazePlugin);
    expect(maze.prompt).toContain("Pick The!");
  });

  it("level 1 callback returns sentence so far and next word tip", () => {
    const items = buildPracticeTimeline([level1]);
    const maze = items.find(t => t.type === MazePlugin);
    const html = maze.on_word_correct({ wordIndex: 0, wordsSelected: ["The"] });
    expect(html).toContain("The");      // sentence so far
    expect(html).toContain("Pick cat!"); // tip for next word
  });

  it("level 2 maze has on_word_correct callback", () => {
    const items = buildPracticeTimeline([level2]);
    const maze = items.find(t => t.type === MazePlugin);
    expect(typeof maze.on_word_correct).toBe("function");
  });

  it("level 2 callback returns sentence so far", () => {
    const items = buildPracticeTimeline([level2]);
    const maze = items.find(t => t.type === MazePlugin);
    const html = maze.on_word_correct({ wordIndex: 0, wordsSelected: ["A"] });
    expect(html).toContain("A");
  });

  it("level 3 maze has no on_word_correct callback", () => {
    const items = buildPracticeTimeline([level3]);
    const maze = items.find(t => t.type === MazePlugin);
    expect(maze.on_word_correct).toBeFalsy();
  });

  it("level 1 and 2 maze use REDO_MESSAGE_PRACTICE on wrong answer", () => {
    const items1 = buildPracticeTimeline([level1]);
    const items2 = buildPracticeTimeline([level2]);
    const maze1 = items1.find(t => t.type === MazePlugin);
    const maze2 = items2.find(t => t.type === MazePlugin);
    expect(maze1.redo_message).toBe(maze2.redo_message);
    expect(maze1.redo_message).toBeTruthy();
  });

  it("all practice maze trials have show_key_labels enabled", () => {
    const items = buildPracticeTimeline([level1, level2, level3]);
    const mazeItems = items.filter((t) => t.type === MazePlugin);
    mazeItems.forEach((maze) => expect(maze.show_key_labels).toBe(true));
  });

  it("level 3 maze uses the standard REDO_MESSAGE", () => {
    const items1 = buildPracticeTimeline([level1]);
    const items3 = buildPracticeTimeline([level3]);
    const maze1 = items1.find(t => t.type === MazePlugin);
    const maze3 = items3.find(t => t.type === MazePlugin);
    expect(maze3.redo_message).not.toBe(maze1.redo_message);
  });

  it("level 1 callback returns sentence so far ABOVE hint text", () => {
    const items = buildPracticeTimeline([level1]);
    const maze = items.find(t => t.type === MazePlugin);
    const html = maze.on_word_correct({ wordIndex: 0, wordsSelected: ["The"] });
    const sentPos = html.indexOf("The");
    const tipPos = html.indexOf("Pick cat!");
    expect(sentPos).toBeLessThan(tipPos);
  });
});
