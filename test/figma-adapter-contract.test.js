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
