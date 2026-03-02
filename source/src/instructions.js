export const CONSENT =
  ' <center><img width="300px" src="assets/stanford.png" /></center>' +
  '<div id="legal"></br>By answering the following questions, you are participating in a study being performed ' +
  "by cognitive scientists in the Stanford Department of Psychology. If you have questions about this " +
  'research, please contact us at  <a href="mailto://languagecoglab@gmail.com."> languagecoglab@gmail.com</a>.' +
  "You must be at least 18 years old to participate. Your participation in this research is voluntary. " +
  "You may decline to answer any or all of the following questions. You may decline further participation, " +
  "at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested " +
  "your participation will not receive any personal information about you. </div></br>";

export const INSTRUCTIONS =
  "<h3>Please read these instructions carefully!</h3> </br>" +
  "<p>For this experiment, please place your <b>left index finger on the 'e' key</b> and" +
  " your <b>right index finger on the 'i' key</b>.</p>" +
  "<p> You will read sentences word by word. " +
  "However, you will have to guess which word comes next. " +
  "On each screen you will see two options: one will be the next word in the sentence, and one will not. </p>" +
  "<p><b>Select the word that continues the sentence by pressing 'e' (left-hand) for the word on the left or " +
  "pressing 'i' (right-hand) for the word on the right.</b></p>" +
  "<p>Select the best word as quickly as you can, but without making too many errors. </p>" +
  '<div><p>Click "Continue" to try this on a practice sentence.</p></div>';

export const INSTRUCTIONS2 =
  "<h3>Please read these instructions carefully!</h3> </br>" +
  "<p>Great job! Now you are ready for the main experiment.</p>" +
  "<p> You will now read 2 short stories in the same word-by-word way.</p>" +
  '<div><p>Click "Continue" to start the experiment.</p>';

export const INSTRUCTIONS_NS =
  "<h3>Please read these instructions carefully!</h3> </br>" +
  "<p>For this experiment, please place your <b>left index finger on the 'e' key</b> and" +
  " your <b>right index finger on the 'i' key</b>.</p>" +
  "<p> You will read a story word by word. " +
  "However, you will have to guess which word comes next. " +
  "On each screen you will see two options: one will be the next word in the sentence, and one will not. </p>" +
  "<p><b>Select the word that continues the sentence by pressing 'e' (left-hand) for the word on the left or " +
  "pressing 'i' (right-hand) for the word on the right.</b></p>" +
  "<p>Select the best word as quickly as you can, but without making too many errors. </p>" +
  '<div><p>Click "Continue" to start the story.</p></div>';

export const INSTRUCTIONS_CRITICAL =
  "<h3>Please read these instructions carefully!</h3> </br>" +
  "<p>For this experiment, please place your <b>left index finger on the 'e' key</b> and" +
  " your <b>right index finger on the 'i' key</b>.</p>" +
  "<p> You will read sentences word by word. " +
  "However, you will have to guess which word comes next. " +
  "On each screen you will see two options: one will be the next word in the sentence, and one will not. </p>" +
  "<p><b>Select the word that continues the sentence by pressing 'e' (left-hand) for the word on the left or " +
  "pressing 'i' (right-hand) for the word on the right.</b></p>" +
  "<p>Select the best word as quickly as you can, but without making too many errors. </p>" +
  '<div><p>Click "Continue" to start the experiment.</p></div>';
export const POST_SURVEY_TEXT =
  "<h1>End of the experiment.</h1>" +
  "Before you go, we have a couple questions about your experience.</br>" +
  "Your " +
  "thoughtful responses here will help us make our future experiments better.";

export const POST_SURVEY_QS = [
  {
    prompt: "What did you think this experiment was about?",
    name: "what-about",
    rows: 4,
  },
  {
    prompt: "Did you notice anything strange about the stories you read?",
    name: "strange",
    rows: 4,
  },
  {
    prompt:
      "Were the instructions and task clear? " +
      "Was there anything you found confusing?",
    name: "understand",
    rows: 4,
  },
  {
    prompt:
      "How was the task length? Would you have " +
      "preferred a shorter or longer task? ",
    name: "length",
    rows: 4,
  },
  {
    prompt: "Were there any problems or errors with the experiment?",
    name: "errors",
    rows: 4,
  },
  { prompt: "Any other comments?", name: "other", rows: 4 },
];
export const DEBRIEF = "<h2>All done! </h2>";
