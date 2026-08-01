import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const pairs = [
  ["docs/en/getting-started.md", "docs/zh-CN/getting-started.md"],
  ["docs/en/product-manager-playbook.md", "docs/zh-CN/product-manager-playbook.md"],
  ["docs/en/troubleshooting.md", "docs/zh-CN/troubleshooting.md"],
  ["docs/en/migration.md", "docs/zh-CN/migration.md"]
];

test("English and Chinese user journeys expose the same controlled commands", async () => {
  for (const pair of pairs) {
    for (const file of pair) {
      const content = await readFile(file, "utf8");
      for (const token of [
        "$layntra status",
        "$layntra plan",
        "$layntra apply",
        "apps/figma-plugin/manifest.json",
        "Plugins → Development",
        "$layntra undo"
      ]) assert.match(content, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${file} is missing ${token}`);
    }
  }
});

test("README links resolve and beginner flow precedes protocol details", async () => {
  for (const file of ["README.md", "README.zh-CN.md"]) {
    const content = await readFile(file, "utf8");
    const quickStart = content.search(/Quick start|五分钟开始/);
    assert.ok(quickStart >= 0, `${file} needs a quick-start heading`);
    const preface = content.slice(0, quickStart);
    assert.doesNotMatch(preface, /\bMCP\b|WebSocket|JSON|API token/i);
    for (const match of content.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+\.md)\)/g)) {
      const path = new URL(match[1], new URL(`file://${process.cwd()}/${file}`)).pathname;
      await access(path);
    }
  }
});

test("bilingual onboarding embeds the Figma manifest import path screenshot", async () => {
  const asset = "docs/assets/figma-import-manifest-path.png";
  await access(asset);
  for (const file of [
    "README.md",
    "README.zh-CN.md",
    "docs/en/getting-started.md",
    "docs/zh-CN/getting-started.md"
  ]) {
    const content = await readFile(file, "utf8");
    assert.match(content, /figma-import-manifest-path\.png/, `${file} is missing the import-path screenshot`);
  }
});

test("bilingual onboarding exposes the stable Figma companion download", async () => {
  const download = "https://github.com/lessthanno/Layntra/releases/tag/v0.1.0";
  for (const file of [
    "README.md",
    "README.zh-CN.md",
    "docs/en/getting-started.md",
    "docs/zh-CN/getting-started.md"
  ]) {
    const content = await readFile(file, "utf8");
    assert.match(content, new RegExp(download.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${file} is missing the download`);
    assert.match(content, /layntra-figma-plugin\.zip/, `${file} must name the release asset`);
    assert.match(content, /unzip|解压/i, `${file} must explain that the download needs extraction`);
  }
});
