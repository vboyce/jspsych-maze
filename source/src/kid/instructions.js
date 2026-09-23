// Instruction screens and maze feedback messages for the kid-friendly demo.

import { kidImage } from "./images.js";

export const INSTRUCTIONS =
  "<h2>We have a fun way to read!</h2>" +
  "<p> You'll see <b>two words</b> on the screen at a time, " +
  "but only one of them belongs in the sentence.</p>" +
  "<p>Your job is to pick the word that fits! Press <b>E</b> for the word on the left, <b>I</b> for the word on the right.</p>" +

  `<img src="${kidImage("keyboard_hand.jpg")}"` +
  ` alt="Hands on a keyboard with E and I highlighted" style="width:70%;max-height:40vh;object-fit:contain;display:block;margin:16px auto;">` +
  "<p>If you pick the wrong word, you'll see <b class='feedback-error'>\"Oops! Wait a moment...\"</b>. That's okay, just wait until you see <b class='feedback-redo'>\"Try again!\"</b> to pick the correct word.</p>" +
  "<p><b>Parents:</b> Please help your child find the E, I, and spacebar keys if needed! You can help them get set up in these warm-up sentences.</p>";

export const preStoriesHtml = (topic1, topic2) =>
  "<h2>Well done!</h2>" +
  `<p>Now you're going to read about two topics: <b>${topic1}</b> and <b>${topic2}</b>.</p>` +
  "<p>Remember: pick the word that fits the sentence.</p>" +
  "<p>Press <b>E</b> for the word on the left, <b>I</b> for the right.</p>" +
  `<img src="${kidImage("keyboard_hand.jpg")}"` +
  ` alt="Hands on a keyboard with E and I highlighted" style="width:70%;max-height:40vh;object-fit:contain;display:block;margin:16px auto;">` +
  "<p>Try to go fast, but it's okay if you make a mistake — you can try again!</p>" +
  "<p><b>Parents:</b> Please let your child respond on their own! If you need to pause, press the pause button in the top right.</p>" +
  `<p>Ready to read about <b>${topic1}</b>? Let's go!</p>`;

export const betweenPassagesHtml = (topic) =>
  "<h2>Great job!</h2>" +
  `<img src="${kidImage("Owl_circling_its_head_repeatedly.gif")}"` +
  ` alt="A baby owl bobbing its head" style="width:60%;max-height:40vh;object-fit:contain;display:block;margin:16px auto;">` +
  "<p>Take a short stretch break, and then we have one more topic for you to read about!</p>" +
  `<p>When you're ready, click <b>Start reading!</b> to read about <b>${topic}</b>!</p>`;

export const INSTRUCTION_IMAGES = [
  "keyboard_hand.jpg",
  "Owl_circling_its_head_repeatedly.gif",
].map(kidImage);

// Shown briefly after a wrong answer (during the delay before the next keypress is accepted).
export const ERROR_MESSAGE = "<p class='feedback-error'>Oops! Wait a moment...</p>";

// Shown after the delay, when the next keypress is accepted.
export const REDO_MESSAGE = "<p class='feedback-redo'>Try again!</p>";

// Shown after the delay during practice levels 1 and 2, with a nudge toward the other word.
export const REDO_MESSAGE_PRACTICE = "<p class='feedback-redo'>Try again! Try choosing the other word!</p>";
