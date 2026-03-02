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

function pop_random(items) {
  let id = Math.floor(Math.random() * items.length);
  return items[id];
}

export function subset(items, total) {
  //choose a random N items
  // shuffle and split into lists
  //shuffle again for final ordering
  //for item in order
  //list.push starter
  //list.push mid
  //list.push last
  let per = total / 4;
  let nums = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
  ];
  shuffle(nums);
  let subset = nums.slice(0, total);
  console.log(subset);
  let vp_1 = subset.slice(0, per);
  let vp_2 = subset.slice(per, 2 * per);
  let np_1 = subset.slice(2 * per, 3 * per);
  let np_2 = subset.slice(3 * per, 4 * per);
  console.log("vp-1");
  console.log(vp_1);
  console.log("vp-2");
  console.log(vp_2);
  console.log("np_1");
  console.log(np_1);
  console.log("np_2");
  console.log(np_2);
  shuffle(subset);
  let stims = [];
  for (let i = 0; i < subset.length; i++) {
    let mini_stims = [];
    let item = items.find((e) => (e.type == "setup") & (e.item == subset[i]));
    mini_stims.push(item);
    if (vp_1.includes(subset[i])) {
      item = items.find((e) => (e.type == "1-context") & (e.item == subset[i]));
      mini_stims.push(item);
      item = items.find((e) => (e.type == "VP") & (e.item == subset[i]));
      mini_stims.push(item);
    } else if (vp_2.includes(subset[i])) {
      item = items.find((e) => (e.type == "2-context") & (e.item == subset[i]));
      mini_stims.push(item);
      item = items.find((e) => (e.type == "VP") & (e.item == subset[i]));
      mini_stims.push(item);
    } else if (np_1.includes(subset[i])) {
      item = items.find((e) => (e.type == "1-context") & (e.item == subset[i]));
      mini_stims.push(item);
      item = items.find((e) => (e.type == "NP") & (e.item == subset[i]));
      mini_stims.push(item);
    } else if (np_2.includes(subset[i])) {
      item = items.find((e) => (e.type == "2-context") & (e.item == subset[i]));
      mini_stims.push(item);
      item = items.find((e) => (e.type == "NP") & (e.item == subset[i]));
      mini_stims.push(item);
    }
    stims.push(mini_stims);
  }
  console.log(stims);
  return stims;
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
          if ((item.id == id) & (item.item_type == item_type)) {
            select_items.push(item);
          }
        });
      }
    }
  }
  shuffle(select_items);
  return select_items;
}
