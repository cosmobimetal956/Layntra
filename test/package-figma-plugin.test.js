import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("Figma companion package is importable and contains only public runtime files", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "layntra-figma-package-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "layntra-figma-plugin.zip");
  const packageResult = spawnSync("/bin/bash", ["scripts/package-figma-plugin.sh", output], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  assert.equal(packageResult.status, 0, packageResult.stderr);

  const listResult = spawnSync("unzip", ["-Z1", output], { encoding: "utf8" });
  assert.equal(listResult.status, 0, listResult.stderr);
  assert.deepEqual(listResult.stdout.trim().split("\n").sort(), [
    "layntra-figma-plugin/",
    "layntra-figma-plugin/README-INSTALL.txt",
    "layntra-figma-plugin/code.js",
    "layntra-figma-plugin/manifest.json",
    "layntra-figma-plugin/ui.html"
  ]);

  for (const file of ["manifest.json", "code.js", "ui.html", "README-INSTALL.txt"]) {
    const archived = spawnSync("unzip", ["-p", output, `layntra-figma-plugin/${file}`], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024
    });
    assert.equal(archived.status, 0, archived.stderr);
    assert.equal(archived.stdout, await readFile(`apps/figma-plugin/${file}`, "utf8"));
  }
});
