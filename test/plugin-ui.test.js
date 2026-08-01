import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Figma companion is bilingual and teaches explicit activation", async () => {
  const html = await readFile("apps/figma-plugin/ui.html", "utf8");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /Layntra for Figma/);
  assert.match(html, /\$layntra status/);
  assert.match(html, /中文/);
  assert.match(html, /English/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /client: "layntra-figma"/);
  assert.match(html, /44px/);
  assert.doesNotMatch(html, /直接描述你想完成的设计/);
  assert.doesNotMatch(html, /嘉宾照片|海报快捷工具/);
});

test("Figma manifest exposes only the local Layntra companion", async () => {
  const manifest = JSON.parse(await readFile("apps/figma-plugin/manifest.json", "utf8"));
  assert.equal(manifest.name, "Layntra for Figma");
  assert.equal(manifest.main, "code.js");
  assert.equal(manifest.ui, "ui.html");
  assert.deepEqual(manifest.editorType, ["figma"]);
  assert.equal(manifest.documentAccess, "dynamic-page");
  assert.deepEqual(manifest.networkAccess.allowedDomains.sort(), ["http://localhost:3846", "ws://localhost:3846"]);
});
