// Prompt shown above the words in the as-maze demo: which vignette this is,
// and a reminder of the keys.
export function format_header(done, trials) {
  return (
    `<p>Story ` +
    done +
    `/` +
    trials +
    "</p><p> Select the next word by pressing <b>e</b> (left) or <b>i</b> (right).</p>"
  );
}
