import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createProgressBar,
  setSection,
  setSectionProgress,
  setSectionLabel,
  progressFraction,
  withSectionProgress,
} from "../progress.js";

function fillWidth(sectionKey) {
  const zone = document.querySelector(`.progress-zone[data-section="${sectionKey}"]`);
  return zone.querySelector(".progress-fill").style.width;
}

// ---------------------------------------------------------------------------
// createProgressBar
// ---------------------------------------------------------------------------

describe("createProgressBar", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("appends a nav#progress-bar to the document body", () => {
    createProgressBar();
    expect(document.querySelector("#progress-bar")).not.toBeNull();
  });

  it("creates a zone for each section with the right label", () => {
    createProgressBar();
    const zone = document.querySelector('.progress-zone[data-section="story-1"]');
    expect(zone.textContent).toContain("Story 1");
  });

  it("creates four zones: learn-how, story-1, story-2, wrap-up", () => {
    createProgressBar();
    const zones = document.querySelectorAll(".progress-zone");
    expect([...zones].map((z) => z.dataset.section)).toEqual([
      "learn-how",
      "story-1",
      "story-2",
      "wrap-up",
    ]);
  });

  it("marks learn-how as active by default", () => {
    createProgressBar();
    const zone = document.querySelector('.progress-zone[data-section="learn-how"]');
    expect(zone.classList.contains("active")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setSection
// ---------------------------------------------------------------------------

describe("setSection", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    createProgressBar();
  });

  it("marks the given section active and earlier sections done", () => {
    setSection("story-2");
    expect(document.querySelector('[data-section="learn-how"]').classList.contains("done")).toBe(true);
    expect(document.querySelector('[data-section="story-1"]').classList.contains("done")).toBe(true);
    expect(document.querySelector('[data-section="story-2"]').classList.contains("active")).toBe(true);
    expect(document.querySelector('[data-section="wrap-up"]').classList.contains("active")).toBe(false);
  });

  it("fills done sections to 100%", () => {
    setSection("story-2");
    expect(fillWidth("learn-how")).toBe("100%");
    expect(fillWidth("story-1")).toBe("100%");
  });

  it("resets the newly active section's fill to 0%", () => {
    setSectionProgress("story-1", 0.6);
    setSection("story-2");
    expect(fillWidth("story-2")).toBe("0%");
  });

  it("leaves not-yet-reached sections at 0% fill", () => {
    setSection("story-1");
    expect(fillWidth("wrap-up")).toBe("0%");
  });
});

// ---------------------------------------------------------------------------
// setSectionLabel
// ---------------------------------------------------------------------------

describe("setSectionLabel", () => {
  function labelText(sectionKey) {
    const zone = document.querySelector(`.progress-zone[data-section="${sectionKey}"]`);
    return zone.querySelector(".progress-label").textContent;
  }

  beforeEach(() => {
    document.body.innerHTML = "";
    createProgressBar();
  });

  it("replaces the label text of the matching section", () => {
    setSectionLabel("story-1", "Whales");
    expect(labelText("story-1")).toBe("Whales");
  });

  it("does not change other sections' labels", () => {
    setSectionLabel("story-1", "Whales");
    expect(labelText("story-2")).toBe("Story 2");
  });

  it("does nothing when the section does not exist", () => {
    expect(() => setSectionLabel("story-99", "Whales")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// setSectionProgress
// ---------------------------------------------------------------------------

describe("setSectionProgress", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    createProgressBar();
  });

  it("sets the fill width of the matching section", () => {
    setSectionProgress("story-1", 0.4);
    expect(fillWidth("story-1")).toBe("40%");
  });

  it("does not change other sections' fill", () => {
    setSectionProgress("story-1", 0.4);
    expect(fillWidth("story-2")).toBe("0%");
  });

  it("clamps fractions above 1 to 100%", () => {
    setSectionProgress("story-1", 1.5);
    expect(fillWidth("story-1")).toBe("100%");
  });

  it("clamps fractions below 0 to 0%", () => {
    setSectionProgress("story-1", -0.5);
    expect(fillWidth("story-1")).toBe("0%");
  });

  it("does nothing when the section does not exist", () => {
    expect(() => setSectionProgress("story-99", 0.5)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// progressFraction
// ---------------------------------------------------------------------------

describe("progressFraction", () => {
  it("returns current divided by total", () => {
    expect(progressFraction(5, 25)).toBe(0.2);
  });

  it("returns 0 when total is 0", () => {
    expect(progressFraction(0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// withSectionProgress
// ---------------------------------------------------------------------------

describe("withSectionProgress", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    createProgressBar();
  });

  it("sets fill to trial-index / total when each trial's on_start fires", () => {
    const trials = [{ stimulus: "a" }, { stimulus: "b" }, { stimulus: "c" }, { stimulus: "d" }];
    withSectionProgress(trials, "learn-how");

    trials[0].on_start();
    expect(fillWidth("learn-how")).toBe("0%");

    trials[2].on_start();
    expect(fillWidth("learn-how")).toBe("50%");
  });

  it("still calls a trial's pre-existing on_start", () => {
    const existing = vi.fn();
    const trials = [{ on_start: existing }];
    withSectionProgress(trials, "wrap-up");

    trials[0].on_start();
    expect(existing).toHaveBeenCalledOnce();
  });

  it("returns the same trials array for chaining", () => {
    const trials = [{ stimulus: "a" }];
    expect(withSectionProgress(trials, "learn-how")).toBe(trials);
  });
});
