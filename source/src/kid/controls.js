function createOverlay(id, contentHtml) {
  const overlay = document.createElement("div");
  overlay.id = id;
  overlay.className = "study-overlay";
  overlay.innerHTML = contentHtml;
  document.body.appendChild(overlay);
  return overlay;
}

export function createPauseButton(jsPsych, container = document.body) {
  const btn = document.createElement("button");
  btn.id = "pause-btn";
  btn.className = "study-control-btn";
  btn.textContent = "Pause";
  container.appendChild(btn);

  btn.addEventListener("click", () => {
    jsPsych.pauseExperiment();
    const overlay = createOverlay(
      "pause-overlay",
      "<h2>Paused</h2>" +
        "<p>Take a break! Press Resume when you're ready.</p>" +
        "<button id='resume-btn' class='study-control-btn'>Resume</button>"
    );
    overlay.querySelector("#resume-btn").addEventListener("click", () => {
      overlay.remove();
      jsPsych.resumeExperiment();
    });
  });

  return {
    hide: () => { btn.style.display = "none"; },
    show: () => { btn.style.display = ""; },
  };
}

// jsPsych.endCurrentTimeline() would be the natural way to skip the rest of a
// nested timeline, but CHS's bundled jsPsych build doesn't expose it. Instead,
// stopFlag.stopped is a shared switch: guarded trials (see applyStopGuard)
// check it via conditional_function and skip themselves once it's set, so
// forcing the current trial to finish is enough to fall through to whatever
// comes after the guarded block (e.g. the wrap-up trials).
export function createStopButton(jsPsych, container = document.body, stopFlag) {
  const btn = document.createElement("button");
  btn.id = "stop-btn";
  btn.className = "study-control-btn";
  btn.textContent = "Stop study";
  container.appendChild(btn);

  btn.addEventListener("click", () => {
    const overlay = createOverlay(
      "stop-overlay",
      "<h2>Stop study?</h2>" +
        "<p>Are you sure you want to stop? Your progress will be saved.</p>" +
        "<button id='stop-keep-going' class='study-control-btn'>Keep going</button>" +
        "<button id='stop-confirm' class='study-control-btn study-control-btn--stop'>Yes, stop</button>"
    );
    overlay.querySelector("#stop-keep-going").addEventListener("click", () => {
      overlay.remove();
    });
    overlay.querySelector("#stop-confirm").addEventListener("click", () => {
      overlay.remove();
      stopFlag.stopped = true;
      jsPsych.pluginAPI.cancelAllKeyboardResponses();
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.finishTrial();
    });
  });

  return {
    hide: () => { btn.style.display = "none"; },
    show: () => { btn.style.display = ""; },
  };
}

// Marks each trial in `trials` to be skipped once stopFlag.stopped is true,
// so jsPsych's normal timeline advancement moves past all of them straight to
// whatever is next (e.g. the wrap-up trials after the main content section).
//
// jsPsych only checks conditional_function on nodes that have their own
// nested `.timeline` array (a bare conditional_function on a flat trial is
// silently ignored), so each trial is wrapped in a one-item nested timeline
// rather than mutated in place.
export function applyStopGuard(trials, stopFlag) {
  return trials.map((trial) => ({
    timeline: [trial],
    conditional_function: () => !stopFlag.stopped,
  }));
}
