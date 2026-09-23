import { describe, it, expect } from "vitest";
import { createGroups, groupText } from "../maze_helper.js";

describe("createGroups", () => {
  it("splits on a regex and returns tokens", () => {
    expect(createGroups("a b c", /\s/u)).toEqual(["a", "b", "c"]);
  });

  it("filters out empty strings from consecutive delimiters", () => {
    expect(createGroups("a  b", /\s/u)).toEqual(["a", "b"]);
  });

  it("filters trailing delimiter", () => {
    expect(createGroups("a b ", /\s/u)).toEqual(["a", "b"]);
  });

  it("returns single-element array when no delimiter present", () => {
    expect(createGroups("hello", /\s/u)).toEqual(["hello"]);
  });

  it("returns empty array for empty string", () => {
    expect(createGroups("", /\s/u)).toEqual([]);
  });
});

describe("groupText", () => {
  it("splits on whitespace when groupingString is null", () => {
    expect(groupText("The cat sat", null)).toEqual(["The", "cat", "sat"]);
  });

  it("handles leading/trailing whitespace", () => {
    expect(groupText("  The cat  ", null)).toEqual(["The", "cat"]);
  });

  it("splits on custom grouping string", () => {
    expect(groupText("the/cat/sat", "/")).toEqual(["the", "cat", "sat"]);
  });

  it("grouping string delimiter is removed from output", () => {
    const result = groupText("a/b/c", "/");
    expect(result).not.toContain("/");
  });

  it("handles comma as grouping string", () => {
    expect(groupText("one,two,three", ",")).toEqual(["one", "two", "three"]);
  });

  it("handles real sentence with punctuation as whitespace split", () => {
    const result = groupText("The dog ran.", null);
    expect(result).toEqual(["The", "dog", "ran."]);
  });

  it("unicode flag is active: handles emoji words without crashing", () => {
    expect(() => groupText("hello 🐱 world", null)).not.toThrow();
  });
});
