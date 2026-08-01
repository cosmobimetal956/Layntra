import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("public audit rejects private data and active legacy branding", async () => {
  const script = await readFile("scripts/audit-public.sh", "utf8");
  for (const pattern of ["/Users/", "email", "Figma file ID", "ai-poster-assistant", "Figma Local MCP"]) {
    assert.match(script, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(script, /git ls-files -z/);
  assert.match(script, /docs\/en\/migration\.md/);
  assert.match(script, /docs\/superpowers/);
  const result = spawnSync("bash", ["scripts/audit-public.sh"], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
