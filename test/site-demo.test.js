import assert from "node:assert/strict";
import test from "node:test";

import { createDemoState, reduceDemoState } from "../docs/assets/site-demo.js";

test("the demo moves through inspect, plan, apply, and undo", () => {
  let state = createDemoState();

  assert.equal(state.stage, "inspect");
  state = reduceDemoState(state, { type: "NEXT" });
  assert.equal(state.stage, "plan");
  state = reduceDemoState(state, { type: "NEXT" });
  assert.equal(state.stage, "apply");
  assert.equal(state.applied, true);
  state = reduceDemoState(state, { type: "NEXT" });
  assert.equal(state.stage, "undo");
  assert.equal(state.applied, false);
});

test("the demo blocks apply when the Figma selection becomes stale", () => {
  let state = reduceDemoState(createDemoState(), { type: "NEXT" });
  state = reduceDemoState(state, { type: "SIMULATE_STALE" });

  assert.equal(state.stage, "plan");
  assert.equal(state.selection, "Frame 13");
  assert.equal(state.target, "Frame 12");

  state = reduceDemoState(state, { type: "NEXT" });
  assert.equal(state.stage, "plan");
  assert.equal(state.blocked, true);
  assert.equal(state.applied, false);
});

test("reinspect adopts the new target before another write", () => {
  let state = reduceDemoState(createDemoState(), { type: "NEXT" });
  state = reduceDemoState(state, { type: "SIMULATE_STALE" });
  state = reduceDemoState(state, { type: "NEXT" });
  state = reduceDemoState(state, { type: "REINSPECT" });

  assert.equal(state.stage, "inspect");
  assert.equal(state.selection, "Frame 13");
  assert.equal(state.target, "Frame 13");
  assert.equal(state.blocked, false);
});
