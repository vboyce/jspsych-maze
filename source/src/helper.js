export function shuffle(arr) {
  var i = arr.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

// The four conditions of the Altmann & Steedman vignettes: which context
// sentence is shown, and which target sentence follows it.
const VIGNETTE_CONDITIONS = [
  ["1-context", "VP"],
  ["2-context", "VP"],
  ["1-context", "NP"],
  ["2-context", "NP"],
];

// Pick `total` random vignettes and assign each one a condition, keeping the
// conditions balanced (counts differ by at most one). Returns one group per
// vignette, [setup, context, target], in random order.
// `items` rows have `type` ("setup", "1-context", "2-context", "VP", "NP")
// and `item` (the vignette id).
export function subset(items, total) {
  const ids = [...new Set(items.map((e) => e.item))];
  if (total > ids.length) {
    throw new Error(`subset: asked for ${total} items but there are only ${ids.length} items`);
  }
  shuffle(ids);
  const chosen = ids.slice(0, total);

  // Shuffle the condition order so that when total isn't a multiple of 4,
  // which conditions get the extra items is random.
  const conditions = VIGNETTE_CONDITIONS.slice();
  shuffle(conditions);

  function findRow(type, id) {
    const row = items.find((e) => e.type === type && e.item === id);
    if (row === undefined) throw new Error(`subset: item ${id} has no "${type}" row`);
    return row;
  }

  return chosen.map((id, i) => {
    const [context, target] = conditions[i % conditions.length];
    return [findRow("setup", id), findRow(context, id), findRow(target, id)];
  });
}

export function counterbalance(item_types, items) {
  let select_items = [];
  for (let i = 0; i < item_types.length; i++) {
    // for each grouping
    let relevant = items.filter((item) => {
      return item_types[i].includes(item.item_type);
    }); // items of this grouping
    let relevant_ids = [];
    shuffle(relevant);
    relevant.forEach((item) => {
      if (!relevant_ids.includes(item.id)) {
        relevant_ids.push(item.id);
      }
    });
    for (let j = 0; j < item_types[i].length; j++) {
      let item_type = item_types[i][j];
      let frac = relevant_ids.length / item_types[i].length;
      let start = Math.floor(j * frac);
      let end = Math.floor((j + 1) * frac);
      for (let k = start; k < end; k++) {
        let id = relevant_ids[k];
        relevant.forEach((item) => {
          if (item.id == id && item.item_type == item_type) {
            select_items.push(item);
          }
        });
      }
    }
  }
  shuffle(select_items);
  return select_items;
}

export function capitalize(word) {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1);
}
