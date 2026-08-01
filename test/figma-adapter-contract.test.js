import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Figma adapter guards generic writes with the planned context", async () => {
  const source = await readFile("apps/figma-plugin/code.js", "utf8");
  assert.match(source, /function getContextSnapshot\(/);
  assert.match(source, /function assertExpectedContext\(/);
  assert.match(source, /expectedContext\.pageId/);
  assert.match(source, /expectedContext\.selectionIds/);
  assert.match(source, /command === "get_context"/);
  assert.match(source, /assertExpectedContext\(args\.expectedContext\)[\s\S]*createGenericNodes/);
  assert.match(source, /assertExpectedContext\(args\.expectedContext\)[\s\S]*updateGenericNodes/);
});

test("Figma adapter creates an undo checkpoint for every successful write", async () => {
  const source = await readFile("apps/figma-plugin/code.js", "utf8");
  assert.match(source, /async function runWrite\(/);
  assert.match(source, /figma\.commitUndo\(\)/);
  assert.match(source, /command === "create_nodes"[\s\S]*runWrite\(\(\) => createGenericNodes/);
  assert.match(source, /command === "update_nodes"[\s\S]*runWrite\(\(\) => updateGenericNodes/);
  assert.match(source, /command === "undo_last"[\s\S]*assertExpectedContext[\s\S]*figma\.triggerUndo\(\)/);
  assert.doesNotMatch(source, /createGenericNodes[\s\S]*currentPage\.selection\s*=/);
});
