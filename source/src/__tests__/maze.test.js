import { describe, it, expect, vi, afterEach } from "vitest";
import MazePlugin from "../maze.js";

// ---------------------------------------------------------------------------
// Shared mock jsPsych factory
// ---------------------------------------------------------------------------

function makeMockJsPsych() {
  let capturedCallback = null;
  const jsPsych = {
    pluginAPI: {
      getKeyboardResponse: ({ callback_function }) => {
        capturedCallback = callback_function;
      },
      // In tests we don't want real timers; execute immediately.
      setTimeout: (fn, _delay) => fn(),
      clearAllTimeouts: vi.fn(),
      cancelAllKeyboardResponses: vi.fn(),
    },
    finishTrial: vi.fn(),
    // Helper to simulate pressing a key.
    // Clear capturedCallback BEFORE calling so re-installation inside the
    // callback (for the next word) isn't immediately overwritten.
    pressKey: (key, rt = 300) => {
      if (!capturedCallback) throw new Error("No keyboard response installed");
      const cb = capturedCallback;
      capturedCallback = null;
      cb({ key, rt });
    },
  };
  return jsPsych;
}

// Minimal display element backed by jsdom
function makeDisplay() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// Minimal trial params with deterministic order
function makeParams(overrides = {}) {
  return {
    correct: "The cat sat",
    distractor: "x-x-x dog ran",
    order: [0, 0, 0], // correct always on left
    prompt: "",
    redo: true,
    delay: 500,
    normal_message: "",
    error_message: "Wrong!",
    redo_message: "Try again.",
    error_guard: 150,
    choice_left: ["e"],
    choice_right: ["i"],
    background_color: "rgb(255,255,255)",
    font_color: "rgb(0,0,0)",
    font_family: "Times New Roman",
    font_size: 60,
    width: 1000,
    height: 100,
    grouping_string: null,
    show_key_labels: false,
    ...overrides,
  };
}

// Clean up any DOM elements appended by makeDisplay() after each test.
afterEach(() => {
  document.body.innerHTML = "";
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MazePlugin — correct-only trial", () => {
  it("calls finishTrial after all correct answers", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100); // The / x-x-x
    jsPsych.pressKey("e", 200); // cat / dog
    jsPsych.pressKey("e", 300); // sat / ran

    expect(jsPsych.finishTrial).toHaveBeenCalledOnce();
  });

  it("records correct rt array matching simulated times", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.rt).toEqual([100, 200, 300]);
  });

  it("records cumrt equal to rt when all correct on first try", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.cumrt).toEqual([100, 200, 300]);
  });

  it("records correct array as all 1s", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.correct).toEqual([1, 1, 1]);
  });

  it("records words matching the correct sentence split by whitespace", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.words).toEqual(["The", "cat", "sat"]);
  });

  it("records distractors matching the distractor sentence split by whitespace", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams());

    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.distractors).toEqual(["x-x-x", "dog", "ran"]);
  });

  it("records order array matching the provided order", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 1, 0] }));

    jsPsych.pressKey("e", 100); // word 0: correct on left, press e
    jsPsych.pressKey("i", 200); // word 1: correct on right, press i
    jsPsych.pressKey("e", 300); // word 2: correct on left, press e

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.order).toEqual([0, 1, 0]);
  });
});

describe("MazePlugin — display / DOM", () => {
  it("with order=0 puts the correct word on the left", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    plugin.trial(display, makeParams({ order: [0, 0, 0] }));

    expect(display.querySelector("#maze-left-word").textContent).toBe("The");
    expect(display.querySelector("#maze-right-word").textContent).toBe("x-x-x");
  });

  it("with order=1 puts the correct word on the right", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    plugin.trial(display, makeParams({ order: [1, 1, 1] }));

    expect(display.querySelector("#maze-left-word").textContent).toBe("x-x-x");
    expect(display.querySelector("#maze-right-word").textContent).toBe("The");
  });
});

describe("MazePlugin — font size scaling", () => {
  it("word of 12 chars uses base font size", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    // Use a 12-char correct word; base font_size = 60
    plugin.trial(display, makeParams({
      correct: "abcdefghijkl sit",
      distractor: "x-x-x ran",
      order: [0, 0],
      font_size: 60,
    }));

    const leftEl = display.querySelector("#maze-left-word");
    expect(leftEl.style.fontSize).toBe("60px");
  });

  it("word longer than 12 chars gets a smaller font size", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    // 15-char word: floor(60 * 12 / 15) = 48
    plugin.trial(display, makeParams({
      correct: "abcdefghijklmno sit",
      distractor: "x-x-x ran",
      order: [0, 0],
      font_size: 60,
    }));

    const leftEl = display.querySelector("#maze-left-word");
    expect(leftEl.style.fontSize).toBe("48px");
  });
});

describe("MazePlugin — redo delay timing", () => {
  it("installs keyboard listener only after both the error delay and the key-release gap have elapsed", () => {
    const pendingTimeouts = [];
    let capturedCallback = null;

    const jsPsych = {
      pluginAPI: {
        getKeyboardResponse: ({ callback_function }) => { capturedCallback = callback_function; },
        setTimeout: (fn, delay) => pendingTimeouts.push({ fn, delay }),
        clearAllTimeouts: vi.fn(),
        cancelAllKeyboardResponses: vi.fn(),
      },
      finishTrial: vi.fn(),
    };

    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], delay: 500 }));

    // Initial listener installed synchronously
    expect(capturedCallback).not.toBeNull();

    // Simulate wrong key press
    const cb = capturedCallback;
    capturedCallback = null;
    cb({ key: "i", rt: 100 }); // wrong (correct is left=e)

    // Error delay is queued; no listener yet
    expect(pendingTimeouts).toHaveLength(1);
    expect(pendingTimeouts[0].delay).toBe(500);
    expect(capturedCallback).toBeNull();

    // Fire the error delay
    pendingTimeouts.shift().fn();

    // Key-release gap is queued; listener still not installed
    expect(pendingTimeouts).toHaveLength(1);
    expect(pendingTimeouts[0].delay).toBe(150);
    expect(capturedCallback).toBeNull();

    // Fire the key-release gap
    pendingTimeouts.shift().fn();

    // Now listener is installed
    expect(capturedCallback).not.toBeNull();
  });
});

describe("MazePlugin — redo mode", () => {
  it("wrong then correct: first-attempt correct[0] is 0", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], delay: null }));

    jsPsych.pressKey("i", 100); // wrong (correct is left=e)
    jsPsych.pressKey("e", 200); // correct on retry
    jsPsych.pressKey("e", 300);
    jsPsych.pressKey("e", 400);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.correct[0]).toBe(0);
  });

  it("wrong then correct: cumrt[0] > rt[0]", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], delay: null }));

    jsPsych.pressKey("i", 100); // wrong
    jsPsych.pressKey("e", 200); // correct retry
    jsPsych.pressKey("e", 300);
    jsPsych.pressKey("e", 400);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.cumrt[0]).toBeGreaterThan(data.rt[0]);
  });

  it("redo=false: finishTrial called immediately after wrong answer", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], redo: false }));

    jsPsych.pressKey("i", 100); // wrong

    expect(jsPsych.finishTrial).toHaveBeenCalledOnce();
  });

  it("redo=false: the wrong answer's rt is recorded once, aligned with correct", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], redo: false }));

    jsPsych.pressKey("e", 100); // correct
    jsPsych.pressKey("i", 200); // wrong → trial ends

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.rt).toEqual([100, 200]);
    expect(data.correct).toEqual([1, 0]);
  });
});

describe("MazePlugin — state isolation between trials", () => {
  it("after a redo=false trial ends on an error, the next trial records every word", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);

    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], redo: false }));
    jsPsych.pressKey("i", 100); // wrong → trial ends

    jsPsych.finishTrial.mockClear();

    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0] }));
    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.rt).toEqual([100, 200, 300]);
    expect(data.correct).toEqual([1, 1, 1]);
  });

  it("second trial starts fresh: first-word correct recorded as 1 when correct", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);

    // First trial: end via wrong answer with redo=false (leaves `first=false` in old code)
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], redo: false }));
    jsPsych.pressKey("i", 100); // wrong → trial ends

    jsPsych.finishTrial.mockClear();

    // Second trial: answer all correctly
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0] }));
    jsPsych.pressKey("e", 100);
    jsPsych.pressKey("e", 200);
    jsPsych.pressKey("e", 300);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.correct[0]).toBe(1);
  });
});

describe("MazePlugin — on_word_wrong callback", () => {
  it("is called on wrong answer with wordIndex and wordsSelected", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const calls = [];
    plugin.trial(makeDisplay(), makeParams({
      order: [0, 0, 0],
      on_word_wrong: (info) => { calls.push({ ...info }); return null; },
    }));

    jsPsych.pressKey("i", 100); // wrong (correct is left=e, word 0)
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ wordIndex: 0, wordsSelected: [] });
  });

  it("return value replaces the redo message shown after delay", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    plugin.trial(display, makeParams({
      order: [0, 0, 0],
      on_word_wrong: ({ wordIndex }) => `<p>Hint for word ${wordIndex}</p>`,
    }));

    jsPsych.pressKey("i", 100); // wrong
    expect(display.querySelector("#feedback").innerHTML).toContain("Hint for word 0");
  });

  it("is not called on correct answers", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const calls = [];
    plugin.trial(makeDisplay(), makeParams({
      order: [0, 0, 0],
      on_word_wrong: (info) => { calls.push(info); return null; },
    }));

    jsPsych.pressKey("e", 100); // correct
    expect(calls).toHaveLength(0);
  });

  it("works when on_word_wrong is not set", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0], delay: null }));

    expect(() => {
      jsPsych.pressKey("i", 100); // wrong — should not throw
    }).not.toThrow();
  });
});

describe("MazePlugin — on_word_correct callback", () => {
  it("is called after each correct word with wordIndex and wordsSelected", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const calls = [];
    const onWordCorrect = (info) => { calls.push({ ...info }); };

    plugin.trial(makeDisplay(), makeParams({
      order: [0, 0, 0],
      on_word_correct: onWordCorrect,
    }));

    jsPsych.pressKey("e", 100); // The
    jsPsych.pressKey("e", 200); // cat
    jsPsych.pressKey("e", 300); // sat

    expect(calls).toHaveLength(3);
    expect(calls[0]).toMatchObject({ wordIndex: 0, wordsSelected: ["The"] });
    expect(calls[1]).toMatchObject({ wordIndex: 1, wordsSelected: ["The", "cat"] });
    expect(calls[2]).toMatchObject({ wordIndex: 2, wordsSelected: ["The", "cat", "sat"] });
  });

  it("updates the status div when callback returns HTML", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const display = makeDisplay();
    const onWordCorrect = ({ wordsSelected }) =>
      `<p>${wordsSelected.join(" ")} →</p>`;

    plugin.trial(display, makeParams({
      order: [0, 0, 0],
      on_word_correct: onWordCorrect,
    }));

    jsPsych.pressKey("e", 100); // The
    expect(display.querySelector("#status").innerHTML).toContain("The →");

    jsPsych.pressKey("e", 200); // cat
    expect(display.querySelector("#status").innerHTML).toContain("The cat →");
  });

  it("is not called on wrong answers", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    const calls = [];
    plugin.trial(makeDisplay(), makeParams({
      order: [0, 0, 0],
      delay: null,
      on_word_correct: (info) => { calls.push(info); },
    }));

    jsPsych.pressKey("i", 100); // wrong
    expect(calls).toHaveLength(0);

    jsPsych.pressKey("e", 200); // correct on retry
    expect(calls).toHaveLength(1);
  });

  it("works when on_word_correct is null (default)", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ order: [0, 0, 0] }));

    // Should not throw
    expect(() => {
      jsPsych.pressKey("e", 100);
      jsPsych.pressKey("e", 200);
      jsPsych.pressKey("e", 300);
    }).not.toThrow();

    expect(jsPsych.finishTrial).toHaveBeenCalledOnce();
  });
});

describe("MazePlugin — error_guard", () => {
  it("waits error_guard ms after the error delay before listening again", () => {
    const pendingTimeouts = [];
    const jsPsych = {
      pluginAPI: {
        getKeyboardResponse: ({ callback_function }) => { jsPsych.cb = callback_function; },
        setTimeout: (fn, delay) => pendingTimeouts.push({ fn, delay }),
        clearAllTimeouts: vi.fn(),
        cancelAllKeyboardResponses: vi.fn(),
      },
      finishTrial: vi.fn(),
    };
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ delay: 500, error_guard: 40 }));

    jsPsych.cb({ key: "i", rt: 100 }); // wrong
    pendingTimeouts.shift().fn(); // error delay

    expect(pendingTimeouts[0].delay).toBe(40);
  });

  it("cumrt includes the error delay and the error guard", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ delay: 500, error_guard: 150 }));

    jsPsych.pressKey("i", 100); // wrong
    jsPsych.pressKey("e", 200); // correct on retry
    jsPsych.pressKey("e", 300);
    jsPsych.pressKey("e", 400);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.cumrt[0]).toBe(100 + 500 + 150 + 200);
    expect(data.rt[0]).toBe(100);
  });

  it("cumrt includes the error guard when delay is null", () => {
    const jsPsych = makeMockJsPsych();
    const plugin = new MazePlugin(jsPsych);
    plugin.trial(makeDisplay(), makeParams({ delay: null, error_guard: 150 }));

    jsPsych.pressKey("i", 100); // wrong
    jsPsych.pressKey("e", 200); // correct on retry
    jsPsych.pressKey("e", 300);
    jsPsych.pressKey("e", 400);

    const data = jsPsych.finishTrial.mock.calls[0][0];
    expect(data.cumrt[0]).toBe(100 + 150 + 200);
  });
});

describe("MazePlugin — show_key_labels", () => {
  it("shows no key labels by default", () => {
    const jsPsych = makeMockJsPsych();
    const display = makeDisplay();
    new MazePlugin(jsPsych).trial(display, makeParams());

    expect(display.querySelectorAll("kbd")).toHaveLength(0);
  });

  it("labels the badges with the configured choice keys", () => {
    const jsPsych = makeMockJsPsych();
    const display = makeDisplay();
    new MazePlugin(jsPsych).trial(display, makeParams({
      show_key_labels: true,
      choice_left: ["f"],
      choice_right: ["j"],
    }));

    const labels = [...display.querySelectorAll("kbd")].map((k) => k.textContent);
    expect(labels).toEqual(["F", "J"]);
  });
});
