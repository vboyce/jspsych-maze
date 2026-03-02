import { shuffle } from "./helper.js";
let raw_choices = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
shuffle(raw_choices);

export const choices = raw_choices;
export const all_images = choices.map(
  (c) => "assets/images/tangram_" + c + ".png"
);

export function format_header(done, trials) {
  return (
    `<p>Story ` +
    done +
    `/` +
    trials +
    "</p><p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>"
  );
}
export function format_spr(stimuli) {
  let prev_speaker = "NA";
  let stuff = [];
  for (let i = 0; i < stimuli.length; i++) {
    let line = stimuli[i];
    let line_info = [];
    if (line.playerId != prev_speaker) {
      line_info.push(line.role);
    } else {
      line_info.push("");
    }
    line_info.push(line.text);
    prev_speaker = line.playerId;
    stuff.push(line_info);
  }
  return stuff;
}
export function format_stimuli(stimuli) {
  let prev_speaker = "NA";
  let html = [`<div class="stimulus"><dl>`];
  for (let i = 0; i < stimuli.length; i++) {
    let line = stimuli[i];
    html.push(doline(prev_speaker, line.playerId, line.role, line.text));
    prev_speaker = line.playerId;
  }
  html.push(`</dl></div>`);
  return html.join("");
}

function format_speaker(role) {
  return `<dt>` + role + `:</dt>`;
}
function doline(prev_speaker, speaker, role, text) {
  let html = [];
  if (prev_speaker != speaker) {
    html.push(format_speaker(role));
  }
  html.push(`<dd>` + text + `<br><dd>`);
  return html.join("");
}

export function give_feedback(last_trial_correct) {
  if (last_trial_correct) {
    return `<div class="feedback"><p style="color:darkgreen">Correct!</p></div>`;
  } else {
    return `<div class="feedback"><p style=" color:#FF0000">Incorrect!</p></div>`;
  }
}
