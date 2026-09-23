import { describe, it, expect } from "vitest";
import { subset, counterbalance, capitalize } from "../helper.js";

// Build an Altmann & Steedman-style item set: for each item id there is a
// setup, two context versions, and two target versions.
function makeVignettes(n) {
  const items = [];
  for (let i = 1; i <= n; i++) {
    for (const type of ["setup", "1-context", "2-context", "VP", "NP"]) {
      items.push({ type, item: String(i) });
    }
  }
  return items;
}

// The condition a subset() group was assigned, e.g. "1-context+VP".
function conditionOf(group) {
  return `${group[1].type}+${group[2].type}`;
}

describe("subset", () => {
  it("returns one group per requested item", () => {
    expect(subset(makeVignettes(32), 8)).toHaveLength(8);
  });

  it("each group is setup, then a context, then a target, all from one item", () => {
    const groups = subset(makeVignettes(32), 8);
    for (const group of groups) {
      expect(group.map((e) => e.type)[0]).toBe("setup");
      expect(["1-context", "2-context"]).toContain(group[1].type);
      expect(["VP", "NP"]).toContain(group[2].type);
      expect(new Set(group.map((e) => e.item)).size).toBe(1);
    }
  });

  it("uses each item id at most once", () => {
    const ids = subset(makeVignettes(32), 12).map((g) => g[0].item);
    expect(new Set(ids).size).toBe(12);
  });

  it("balances the four conditions to within one", () => {
    for (const total of [2, 4, 6, 8]) {
      const counts = {};
      for (const g of subset(makeVignettes(32), total)) {
        counts[conditionOf(g)] = (counts[conditionOf(g)] || 0) + 1;
      }
      const values = Object.values(counts);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
    }
  });

  it("with fewer than four items, any condition can be chosen", () => {
    const seen = new Set();
    for (let run = 0; run < 200; run++) {
      for (const g of subset(makeVignettes(32), 2)) seen.add(conditionOf(g));
    }
    expect([...seen].sort()).toEqual(
      ["1-context+NP", "1-context+VP", "2-context+NP", "2-context+VP"]
    );
  });

  it("throws when asked for more items than exist", () => {
    expect(() => subset(makeVignettes(4), 5)).toThrow(/only 4 items/);
  });

  it("throws when an item is missing one of its rows", () => {
    const items = makeVignettes(1).filter((e) => e.type !== "NP");
    // With one item and many runs, the NP row is eventually needed.
    expect(() => {
      for (let run = 0; run < 200; run++) subset(items, 1);
    }).toThrow(/item 1 has no "NP" row/);
  });
});

describe("counterbalance", () => {
  const items = [1, 2, 3, 4].flatMap((id) => [
    { id, item_type: "a_high" },
    { id, item_type: "a_low" },
  ]);

  it("shows each item id once, in one of its conditions", () => {
    const chosen = counterbalance([["a_high", "a_low"]], items);
    expect(chosen.map((i) => i.id).sort()).toEqual([1, 2, 3, 4]);
  });

  it("splits item ids evenly across conditions", () => {
    const chosen = counterbalance([["a_high", "a_low"]], items);
    expect(chosen.filter((i) => i.item_type === "a_high")).toHaveLength(2);
    expect(chosen.filter((i) => i.item_type === "a_low")).toHaveLength(2);
  });
});

describe("capitalize", () => {
  it("uppercases the first letter of a lowercase word", () => {
    expect(capitalize("whales")).toBe("Whales");
  });

  it("leaves an already-capitalized word unchanged", () => {
    expect(capitalize("Dinosaurs")).toBe("Dinosaurs");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});
