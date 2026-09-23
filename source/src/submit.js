// Data submission for the demo experiments, for Proliferate
// (https://proliferate.alps.science).
//
// Returns on_finish / on_close handlers for initJsPsych that submit the data
// at most once:
//   - on_finish submits the full data set with `submit`.
//   - on_close (the participant closes the page early) sends the partial data
//     with a beacon, but only when the page has Proliferate's experiment_id and
//     participant_id URL parameters. Without them, nothing is sent; this is how
//     the public demos run.
//
// Dependencies are passed in so the handlers can be tested without a browser:
//   getData()             -> array of trial data
//   submit(data)          -> e.g. proliferate.submit
//   sendBeacon(url, form) -> e.g. navigator.sendBeacon
//   search                -> e.g. window.location.search
const PROLIFERATE_COMPLETE_URL = "https://proliferate.alps.science/experiment/{exp_id}/complete";

export function makeSubmitHandlers({ getData, submit, sendBeacon, search }) {
  let submitted = false;

  function on_finish() {
    if (submitted) return;
    submitted = true;
    submit({ trials: getData() });
  }

  function on_close() {
    if (submitted) return;
    const params = new URLSearchParams(search);
    const experiment_id = params.get("experiment_id");
    const participant_id = params.get("participant_id");
    if (!experiment_id || !participant_id) return;
    submitted = true;
    const formData = new FormData();
    formData.append("data", JSON.stringify({ trials: getData() }));
    formData.append("participant_id", participant_id);
    sendBeacon(PROLIFERATE_COMPLETE_URL.replace("{exp_id}", experiment_id), formData);
  }

  return { on_finish, on_close };
}
