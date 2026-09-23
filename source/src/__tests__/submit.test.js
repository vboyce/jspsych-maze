import { describe, it, expect, vi } from "vitest";
import { makeSubmitHandlers } from "../submit.js";

function setup(search = "?experiment_id=e1&participant_id=p1") {
  const deps = {
    getData: () => [{ trial_type: "maze" }],
    submit: vi.fn(),
    sendBeacon: vi.fn(),
    search,
  };
  return { deps, handlers: makeSubmitHandlers(deps) };
}

describe("makeSubmitHandlers", () => {
  it("on_finish submits the data", () => {
    const { deps, handlers } = setup();
    handlers.on_finish();
    expect(deps.submit).toHaveBeenCalledWith({ trials: [{ trial_type: "maze" }] });
  });

  it("closing the page after finishing does not submit again", () => {
    const { deps, handlers } = setup();
    handlers.on_finish();
    handlers.on_close();
    expect(deps.submit).toHaveBeenCalledOnce();
    expect(deps.sendBeacon).not.toHaveBeenCalled();
  });

  it("closing the page early sends the partial data once, by beacon", () => {
    const { deps, handlers } = setup();
    handlers.on_close();
    handlers.on_close();
    expect(deps.sendBeacon).toHaveBeenCalledOnce();
    expect(deps.sendBeacon.mock.calls[0][0]).toBe(
      "https://proliferate.alps.science/experiment/e1/complete"
    );
  });

  it("closing the page early without Proliferate URL parameters sends nothing", () => {
    const { deps, handlers } = setup("");
    handlers.on_close();
    expect(deps.sendBeacon).not.toHaveBeenCalled();
    expect(deps.submit).not.toHaveBeenCalled();
  });
});
