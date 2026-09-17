/**
 * Splits text into tokens and discards empty strings. The
 * tokens are defined by the regular expression used to
 * split the string.
 *
 * @param {String} text The text to splint into tokens
 * @param {RegExp} re   The regular expression used to split the string
 *
 * @return An array of strings as tokens.
 */
export function createGroups(text, re) {
  return text.split(re).filter(function (word) {
    return word != "";
  });
}

/**
 * Takes a text and grouping string, splits it on that
 * returns the list of groups (usually words)
 * but other groupingStrings will allow for other splits.
 */
export function groupText(text, groupingString) {
  let stimulus = text;
  let groups;
  if (groupingString) {
    let grouping_re = RegExp(groupingString, "ug");
    groups = createGroups(stimulus, grouping_re);
  } else {
    groups = createGroups(stimulus, RegExp("\\s", "u"));
  }
  return groups;
}
