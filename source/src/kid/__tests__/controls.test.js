import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPauseButton, createStopButton, applyStopGuard } from "../controls.js";

// ---------------------------------------------------------------------------
// createPauseButton
// ---------------------------------------------------------------------------

describe("createPauseButton", () => {
  let mockJsPsych;

  beforeEach(() => {
    document.body.innerHTML = "";
    mockJsPsych = {
      pauseExperiment: vi.fn(),
      resumeExperiment: vi.fn(),
    };
  });

  it("appends a pause button to the document body", () => {
    createPauseButton(mockJsPsych);
    expect(document.querySelector("#pause-btn")).not.toBeNull();
  });

  it("clicking pause calls pauseExperiment", () => {
    createPauseButton(mockJsPsych);
    document.querySelector("#pause-btn").click();
    expect(mockJsPsych.pauseExperiment).toHaveBeenCalledOnce();
  });

  it("clicking pause shows the pause overlay", () => {
    createPauseButton(mockJsPsych);
    document.querySelector("#pause-btn").click();
    expect(document.querySelector("#pause-overlay")).not.toBeNull();
  });

  it("clicking resume removes the overlay", () => {
    createPauseButton(mockJsPsych);
    document.querySelector("#pause-btn").click();
    document.querySelector("#resume-btn").click();
    expect(document.querySelector("#pause-overlay")).toBeNull();
  });

  it("clicking resume calls resumeExperiment", () => {
    createPauseButton(mockJsPsych);
    document.querySelector("#pause-btn").click();
    document.querySelector("#resume-btn").click();
    expect(mockJsPsych.resumeExperiment).toHaveBeenCalledOnce();
  });

  it("hide() sets the button display to none", () => {
    const { hide } = createPauseButton(mockJsPsych);
    hide();
    expect(document.querySelector("#pause-btn").style.display).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// createStopButton
// ---------------------------------------------------------------------------

describe("createStopButton", () => {
  let mockJsPsych;
  let stopFlag;

  beforeEach(() => {
    document.body.innerHTML = "";
    stopFlag = { stopped: false };
    mockJsPsych = {
      finishTrial: vi.fn(),
      pluginAPI: {
        cancelAllKeyboardResponses: vi.fn(),
        clearAllTimeouts: vi.fn(),
      },
    };
  });

  it("appends a stop button to the document body", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    expect(document.querySelector("#stop-btn")).not.toBeNull();
  });

  it("clicking stop shows the confirmation overlay", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    document.querySelector("#stop-btn").click();
    expect(document.querySelector("#stop-overlay")).not.toBeNull();
  });

  it("clicking Keep going removes the overlay without setting the stop flag", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    document.querySelector("#stop-btn").click();
    document.querySelector("#stop-keep-going").click();
    expect(stopFlag.stopped).toBe(false);
    expect(document.querySelector("#stop-overlay")).toBeNull();
  });

  it("clicking Yes stop sets the shared stop flag (so guarded trials skip themselves)", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    document.querySelector("#stop-btn").click();
    document.querySelector("#stop-confirm").click();
    expect(stopFlag.stopped).toBe(true);
  });

  it("clicking Yes stop cancels pending keyboard/timeout callbacks before forcing the current trial to finish", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    document.querySelector("#stop-btn").click();
    document.querySelector("#stop-confirm").click();
    expect(mockJsPsych.pluginAPI.cancelAllKeyboardResponses).toHaveBeenCalledOnce();
    expect(mockJsPsych.pluginAPI.clearAllTimeouts).toHaveBeenCalledOnce();
    expect(mockJsPsych.finishTrial).toHaveBeenCalledOnce();
  });

  it("clicking Yes stop removes the overlay before ending", () => {
    createStopButton(mockJsPsych, document.body, stopFlag);
    document.querySelector("#stop-btn").click();
    document.querySelector("#stop-confirm").click();
    expect(document.querySelector("#stop-overlay")).toBeNull();
  });

  it("hide() sets the button display to none", () => {
    const { hide } = createStopButton(mockJsPsych, document.body, stopFlag);
    hide();
    expect(document.querySelector("#stop-btn").style.display).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// applyStopGuard
// ---------------------------------------------------------------------------

describe("applyStopGuard", () => {
  // conditional_function is only ever checked by jsPsych on nodes that have
  // their own nested `.timeline` array (see jsPsych's TimelineNode.advance());
  // a bare conditional_function on a flat trial object is silently ignored.
  // So each trial must come back wrapped in a one-item nested timeline.

  it("wraps each trial in its own single-item nested timeline", () => {
    const trials = [{ stimulus: "a" }, { stimulus: "b" }];
    const guarded = applyStopGuard(trials, { stopped: false });
    expect(guarded[0].timeline).toEqual([trials[0]]);
    expect(guarded[1].timeline).toEqual([trials[1]]);
  });

  it("gives each wrapper a conditional_function that is true while not stopped", () => {
    const stopFlag = { stopped: false };
    const trials = [{ stimulus: "a" }, { stimulus: "b" }];
    const guarded = applyStopGuard(trials, stopFlag);
    expect(guarded[0].conditional_function()).toBe(true);
    expect(guarded[1].conditional_function()).toBe(true);
  });

  it("conditional_function becomes false once the flag is set", () => {
    const stopFlag = { stopped: false };
    const trials = [{ stimulus: "a" }];
    const guarded = applyStopGuard(trials, stopFlag);
    stopFlag.stopped = true;
    expect(guarded[0].conditional_function()).toBe(false);
  });

  it("returns one wrapper per input trial", () => {
    const trials = [{ stimulus: "a" }, { stimulus: "b" }, { stimulus: "c" }];
    expect(applyStopGuard(trials, { stopped: false })).toHaveLength(3);
  });
});
