import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

async function runInstaller(t, { nodeMajor = 20, marketplace = "missing", includeCodex = true, language = "en" } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "layntra-install-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const log = path.join(dir, "codex.log");
  const fakeNode = `#!/bin/sh
if [ "$1" = "-p" ]; then echo ${nodeMajor}; else echo v${nodeMajor}.0.0; fi
`;
  await writeFile(path.join(dir, "node"), fakeNode);
  await chmod(path.join(dir, "node"), 0o755);
  if (includeCodex) {
    const listing = marketplace === "missing"
      ? "MARKETPLACE ROOT"
      : marketplace === "same"
        ? `MARKETPLACE ROOT\\nlayntra ${process.cwd()}`
        : "MARKETPLACE ROOT\\nlayntra /different/repository";
    const fakeCodex = `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_CODEX_LOG"
if [ "$*" = "plugin marketplace list" ]; then printf '${listing}\\n'; fi
`;
    await writeFile(path.join(dir, "codex"), fakeCodex);
    await chmod(path.join(dir, "codex"), 0o755);
  }
  const result = spawnSync("/bin/bash", ["scripts/install.sh"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${dir}:/usr/bin:/bin`,
      FAKE_CODEX_LOG: log,
      LAYNTRA_LANG: language
    }
  });
  let codexLog = "";
  try { codexLog = await readFile(log, "utf8"); } catch {}
  return { ...result, codexLog };
}

test("installer registers and installs Layntra with actionable output", async (t) => {
  const result = await runInstaller(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Layntra/);
  assert.match(result.codexLog, /plugin marketplace add/);
  assert.match(result.codexLog, /plugin add layntra@layntra/);
  assert.match(result.stdout, /apps\/figma-plugin\/manifest\.json/);
  assert.match(result.stdout, /\$layntra status/);
});

test("installer is idempotent for the same marketplace path", async (t) => {
  const result = await runInstaller(t, { marketplace: "same", language: "zh-CN" });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.codexLog, /marketplace add/);
  assert.match(result.stdout, /已安装/);
});

test("installer rejects an old Node runtime", async (t) => {
  const result = await runInstaller(t, { nodeMajor: 18 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Node\.js 20/);
});

test("installer rejects a missing Codex command", async (t) => {
  const result = await runInstaller(t, { includeCodex: false });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Codex/);
});

test("installer preserves a conflicting marketplace registration", async (t) => {
  const result = await runInstaller(t, { marketplace: "conflict" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /different\/repository/);
  assert.doesNotMatch(result.codexLog, /marketplace add/);
});
