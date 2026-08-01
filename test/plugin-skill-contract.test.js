import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Layntra requires explicit controlled activation", async () => {
  const skill = await readFile("skills/layntra/SKILL.md", "utf8");
  assert.match(skill, /^name: layntra$/m);
  assert.match(skill, /\$layntra/);
  assert.match(skill, /status.*inspect.*review.*plan/s);
  assert.match(skill, /No Figma changes made|尚未修改 Figma/);
  assert.match(skill, /expectedContext/);
  assert.match(skill, /Command \+ Z/);
  assert.match(skill, /Never auto-activate/i);
});

test("Codex metadata exposes only controlled Layntra prompts", async () => {
  const metadata = JSON.parse(await readFile(".codex-plugin/plugin.json", "utf8"));
  const mcp = JSON.parse(await readFile(".mcp.json", "utf8"));
  assert.equal(metadata.name, "layntra");
  assert.equal(metadata.version, "0.1.0");
  assert.equal(metadata.interface.displayName, "Layntra");
  assert.equal(metadata.mcpServers, "./.mcp.json");
  assert.ok(metadata.interface.defaultPrompt.every((prompt) => prompt.startsWith("$layntra")));
  assert.ok(mcp.mcpServers.layntra);
});

test("Poster example remains explicitly opt-in", async () => {
  const skill = await readFile("skills/poster-example/SKILL.md", "utf8");
  assert.match(skill, /^name: poster-example$/m);
  assert.match(skill, /\$layntra/);
  assert.match(skill, /explicit/i);
});
