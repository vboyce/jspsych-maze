const SECTIONS = ["learn-how", "story-1", "story-2", "wrap-up"];
const LABELS = {
  "learn-how": "Learn how",
  "story-1": "Story 1",
  "story-2": "Story 2",
  "wrap-up": "Wrap-up",
};

export function createProgressBar(container = document.body) {
  const nav = document.createElement("nav");
  nav.id = "progress-bar";

  const zones = document.createElement("div");
  zones.className = "progress-zones";

  SECTIONS.forEach((key) => {
    const zone = document.createElement("div");
    zone.className = "progress-zone";
    zone.dataset.section = key;

    const label = document.createElement("span");
    label.className = "progress-label";
    label.textContent = LABELS[key];

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = "0%";
    track.appendChild(fill);

    zone.appendChild(label);
    zone.appendChild(track);
    zones.appendChild(zone);
  });

  nav.appendChild(zones);
  container.insertBefore(nav, container.firstChild);
  setSection("learn-how");
  return nav;
}

export function setSection(key) {
  const idx = SECTIONS.indexOf(key);
  document.querySelectorAll(".progress-zone").forEach((zone, i) => {
    zone.classList.toggle("active", i === idx);
    zone.classList.toggle("done", i < idx);
    if (i <= idx) setZoneFill(zone, i < idx ? 1 : 0);
    else setZoneFill(zone, 0);
  });
}

export function setSectionLabel(key, text) {
  const zone = document.querySelector(`.progress-zone[data-section="${key}"]`);
  if (!zone) return;
  zone.querySelector(".progress-label").textContent = text;
}

export function setSectionProgress(key, fraction) {
  const zone = document.querySelector(`.progress-zone[data-section="${key}"]`);
  if (!zone) return;
  setZoneFill(zone, fraction);
}

export function progressFraction(current, total) {
  return total > 0 ? current / total : 0;
}

// Mutates each trial to set its section's fill fraction (index / trials.length)
// on_start, preserving any on_start the trial already had.
export function withSectionProgress(trials, key) {
  trials.forEach((trial, i) => {
    const prevOnStart = trial.on_start;
    trial.on_start = (arg) => {
      setSectionProgress(key, progressFraction(i, trials.length));
      if (prevOnStart) prevOnStart(arg);
    };
  });
  return trials;
}

function setZoneFill(zone, fraction) {
  const clamped = Math.max(0, Math.min(1, fraction));
  zone.querySelector(".progress-fill").style.width = `${clamped * 100}%`;
}
