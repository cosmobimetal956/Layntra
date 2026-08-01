# Layntra Open-Source Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the verified local Figma bridge into the bilingual, controlled `$layntra` Codex plugin and publish its preserved Git history to `lessthanno/Layntra`.

**Architecture:** Keep one repository and one installer. The Codex Skill owns user intent and the inspect/plan/apply policy, the stdio MCP bridge owns validation and loopback transport, and `Layntra for Figma` owns bounded document access plus a visible connection UI. Preserve existing MCP tool names for migration compatibility while adding context snapshots that prevent writes against stale pages or selections.

**Tech Stack:** Codex plugin manifest and Skills, Node.js 20+ ESM with built-in `node:test`, Figma Plugin API, HTML/CSS/vanilla JavaScript, Bash, GitHub Actions.

## Global Constraints

- The public product is a Codex plugin; the Figma companion is a required local adapter.
- Users explicitly invoke `$layntra`; unrelated prompts must not auto-activate it.
- `status`, `inspect`, `review`, and `plan` are read-only.
- `create`, `apply`, and `refine` require a displayed plan, explicit approval, an explicit target, and post-write verification.
- New content defaults to `new-frame`; page-wide writes and deletion are unavailable in `v0.1.0`.
- The bridge remains loopback-only on `127.0.0.1:3846`, uses no Figma API token, and sends no telemetry.
- Node.js 20 is the minimum runtime and no runtime dependency is added without review.
- English and Simplified Chinese must document the same installation, import, operation, and recovery path.
- Preserve existing Git history and compatible MCP tool names.
- Do not ship personal paths, email addresses, secrets, disposable Figma file IDs, or organization-specific content.
- Do not create a `v0.1.0` tag until clean installation and real Figma E2E pass.

---

## File map

### Runtime

- `apps/figma-plugin/manifest.json`: Figma metadata and loopback permission.
- `apps/figma-plugin/code.js`: Figma document adapter, context snapshots, stale-context guards, bounded reads and writes.
- `apps/figma-plugin/ui.html`: bilingual visible connection state and explicit `$layntra` instructions.
- `packages/mcp-bridge/server.js`: MCP server, schemas, errors, request correlation, timeouts, and WebSocket transport.
- `packages/mcp-bridge/package.json`: bridge scripts and version.
- `skills/layntra/SKILL.md`: explicit activation and controlled inspect/plan/apply behavior.
- `skills/poster-example/SKILL.md`: optional poster workflow with no default activation.
- `.codex-plugin/plugin.json`: public Codex plugin metadata.
- `.mcp.json`: local server registration.

### Tests and scripts

- `packages/mcp-bridge/test/standalone.test.js`: initialization, tool schemas, status, validation, and branding.
- `packages/mcp-bridge/test/roundtrip.test.js`: simulated Figma WebSocket integration and context propagation.
- `test/figma-adapter-contract.test.js`: static contract checks for context guards and supported write operations.
- `test/plugin-skill-contract.test.js`: explicit `$layntra` control-policy checks.
- `test/plugin-ui.test.js`: bilingual companion UI and accessibility checks.
- `test/install.test.js`: clean installer behavior with isolated fake Codex and Node commands.
- `scripts/install.sh`: one-command bilingual installer.
- `scripts/audit-public.sh`: stale-brand, personal-data, secret-pattern, and path audit.
- `package.json`: repository-wide checks.

### Documentation and governance

- `README.md`, `README.zh-CN.md`: paired five-minute entry points.
- `docs/en/*`, `docs/zh-CN/*`: paired onboarding, product-manager playbook, troubleshooting, and migration.
- `docs/adr/0003-layntra-codex-control-contract.md`: rename and controlled interaction decision.
- `docs/testing/e2e-report.md`: public test evidence without private identifiers.
- `.github/workflows/ci.yml`: supported automated gates.
- `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`: contribution intake.
- `CONTRIBUTING.md`, `CONTRIBUTING.zh-CN.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`: open-source governance.

---

### Task 1: Record the public architecture decision and repository quality entry point

**Files:**
- Create: `docs/adr/0003-layntra-codex-control-contract.md`
- Create: `package.json`
- Modify: `docs/adr/0002-core-and-example-skills.md`
- Test: repository commands in `package.json`

**Interfaces:**
- Consumes: approved product design at `docs/superpowers/specs/2026-08-01-layntra-open-source-design.md`.
- Produces: root commands `npm test`, `npm run check`, and `npm run audit:public`; accepted ADR 0003 superseding ADR 0002 naming guidance.

- [ ] **Step 1: Add the root quality-command manifest**

```json
{
  "name": "layntra",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "check": "node --check apps/figma-plugin/code.js && node --check packages/mcp-bridge/server.js",
    "test": "node --test packages/mcp-bridge/test/*.test.js test/*.test.js",
    "audit:public": "bash scripts/audit-public.sh",
    "verify": "npm run check && npm test && npm run audit:public"
  }
}
```

- [ ] **Step 2: Write ADR 0003 with the rejected alternatives**

The ADR must record: Layntra as the public name; Codex plugin as the product;
Figma companion as the adapter; explicit `$layntra` activation; read-only versus
write intents; latest-plan approval; `new-frame` default; stale-context stop;
post-write verification; compatibility of existing MCP tool names; monorepo
instead of brand-only rename or multiple repositories; rollback by reverting
the reorganization before tagging.

- [ ] **Step 3: Mark ADR 0002 as superseded only for naming and activation**

Add `Superseded in part by ADR 0003` while retaining its accepted separation of
core and example Skills.

- [ ] **Step 4: Verify the documentation change and commit**

Run: `git diff --check && rg -n "Layntra|\$layntra|new-frame" docs/adr/0003-layntra-codex-control-contract.md`

Expected: no whitespace error; the decision terms are present.

```bash
git add package.json docs/adr/0002-core-and-example-skills.md docs/adr/0003-layntra-codex-control-contract.md
git commit -m "docs: define Layntra control contract"
```

---

### Task 2: Reorganize the repository without changing runtime behavior

**Files:**
- Move: `manifest.json` → `apps/figma-plugin/manifest.json`
- Move: `code.js` → `apps/figma-plugin/code.js`
- Move: `ui.html` → `apps/figma-plugin/ui.html`
- Move: `plugins/ai-poster-assistant/mcp-bridge/*` → `packages/mcp-bridge/*`
- Move: `plugins/ai-poster-assistant/skills/figma-local-mcp/SKILL.md` → `skills/layntra/SKILL.md`
- Move: `plugins/ai-poster-assistant/skills/ai-poster-assistant/SKILL.md` → `skills/poster-example/SKILL.md`
- Modify: `.codex-plugin/plugin.json`
- Modify: `.mcp.json`

**Interfaces:**
- Consumes: current bridge entry point `plugins/ai-poster-assistant/mcp-bridge/server.js` and root Figma manifest.
- Produces: stable public paths from the file map; `.mcp.json` uses `cwd: "./packages/mcp-bridge"`; plugin metadata uses `skills: "./skills/"`.

- [ ] **Step 1: Capture the pre-move baseline**

Run:

```bash
node --check code.js
npm --prefix plugins/ai-poster-assistant/mcp-bridge test
```

Expected: syntax passes and four existing tests pass.

- [ ] **Step 2: Move files with Git-aware commands**

```bash
mkdir -p apps/figma-plugin packages skills
git mv manifest.json code.js ui.html apps/figma-plugin/
git mv plugins/ai-poster-assistant/mcp-bridge packages/mcp-bridge
git mv plugins/ai-poster-assistant/skills/figma-local-mcp skills/layntra
git mv plugins/ai-poster-assistant/skills/ai-poster-assistant skills/poster-example
```

Remove now-empty tracked directories only after `git status` confirms that all
content is represented as renames.

- [ ] **Step 3: Point the Codex plugin at the new runtime paths**

Set `.mcp.json` to:

```json
{
  "mcpServers": {
    "layntra": {
      "title": "Layntra",
      "description": "Local bridge for controlled Codex edits in the open Figma Desktop file.",
      "cwd": "./packages/mcp-bridge",
      "command": "node",
      "args": ["server.js"]
    }
  }
}
```

Set `.codex-plugin/plugin.json` paths to `./skills/` and `./.mcp.json`. Do not
change activation behavior in this task.

- [ ] **Step 4: Run the same tests from the new locations**

Run: `npm run check && npm --prefix packages/mcp-bridge test`

Expected: the existing four tests pass without assertion changes other than
path-independent brand assertions introduced later.

- [ ] **Step 5: Commit the mechanical migration**

```bash
git add -A
git commit -m "refactor: organize Layntra monorepo"
```

---

### Task 3: Add Layntra context snapshots and stale-write protection

**Files:**
- Modify: `packages/mcp-bridge/server.js`
- Modify: `apps/figma-plugin/code.js`
- Modify: `apps/figma-plugin/ui.html`
- Modify: `packages/mcp-bridge/package.json`
- Test: `packages/mcp-bridge/test/standalone.test.js`
- Test: `packages/mcp-bridge/test/roundtrip.test.js`
- Create: `test/figma-adapter-contract.test.js`

**Interfaces:**
- Consumes: Figma commands `get_document`, `get_selection`, `create_nodes`, and `update_nodes`.
- Produces: command `get_context`; return type `{ fileName, page: { id, name }, selection: Array<{ id, name, type }>, fingerprint }`; optional write argument `expectedContext: { pageId: string, selectionIds: string[] }`.

- [ ] **Step 1: Write failing MCP branding and status-context tests**

Add assertions equivalent to:

```js
assert.equal(response.result.serverInfo.name, "layntra");
assert.equal(response.result.serverInfo.version, "0.1.0");
assert.match(stderr, /Layntra bridge ready/);
```

Extend the simulated client so `get_status` receives a `get_context` command
and replies:

```js
{
  fileName: "Disposable E2E",
  page: { id: "0:1", name: "Page 1" },
  selection: [{ id: "1:2", name: "Login Card", type: "FRAME" }],
  fingerprint: "0:1|1:2"
}
```

Assert the MCP result includes those fields and `figmaPlugin: "connected"`.

- [ ] **Step 2: Write failing stale-context contract tests**

In `roundtrip.test.js`, send `update_nodes` with:

```js
{
  expectedContext: { pageId: "0:1", selectionIds: ["1:2"] },
  updates: [{ id: "1:3", text: "Updated" }]
}
```

Assert the WebSocket command forwards `expectedContext` unchanged. In
`test/figma-adapter-contract.test.js`, read `apps/figma-plugin/code.js` and
assert it contains `assertExpectedContext`, `expectedContext.pageId`, and
`expectedContext.selectionIds` before both generic write calls.

- [ ] **Step 3: Run the targeted tests and confirm failure**

Run: `node --test packages/mcp-bridge/test/standalone.test.js packages/mcp-bridge/test/roundtrip.test.js test/figma-adapter-contract.test.js`

Expected: failure because Layntra branding, `get_context`, and the guard do not
exist.

- [ ] **Step 4: Implement the Figma context functions**

Add these interfaces to `apps/figma-plugin/code.js`:

```js
function getContextSnapshot() {
  const selection = figma.currentPage.selection.map(({ id, name, type }) => ({ id, name, type }));
  return {
    fileName: figma.root.name,
    page: { id: figma.currentPage.id, name: figma.currentPage.name },
    selection,
    fingerprint: `${figma.currentPage.id}|${selection.map(({ id }) => id).sort().join(",")}`
  };
}

function assertExpectedContext(expectedContext) {
  if (!expectedContext) return;
  const current = getContextSnapshot();
  const expectedIds = [...expectedContext.selectionIds].sort();
  const actualIds = current.selection.map(({ id }) => id).sort();
  if (expectedContext.pageId !== current.page.id || JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
    throw new Error("Figma context changed after planning. Inspect again before applying.");
  }
}
```

Handle `get_context`, and call `assertExpectedContext(args.expectedContext)`
immediately before `createGenericNodes` and `updateGenericNodes`.

- [ ] **Step 5: Implement connected `get_status` and public branding**

When no companion is connected, return a stable English machine payload with
an actionable `nextStep`. When connected, call `get_context` and merge it with
`{ bridge: "ready", figmaPlugin: "connected" }`. Rename the environment variable
to `LAYNTRA_PORT`, but accept `AI_POSTER_PORT` as a deprecated fallback for the
first release:

```js
const PORT = Number(process.env.LAYNTRA_PORT || process.env.AI_POSTER_PORT || 3846);
```

Use `layntra` for MCP server info and `Layntra bridge ready` for startup logs.
Accept WebSocket hello client `layntra-figma`; temporarily accept
`ai-poster-assistant` for migration compatibility.

- [ ] **Step 6: Run the focused and complete suites**

Run: `npm run check && npm test`

Expected: all context, branding, legacy compatibility, and existing round-trip
tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/figma-plugin packages/mcp-bridge test/figma-adapter-contract.test.js
git commit -m "feat: guard Layntra writes with Figma context"
```

---

### Task 4: Implement the explicit `$layntra` Codex Skill contract

**Files:**
- Modify: `skills/layntra/SKILL.md`
- Modify: `skills/poster-example/SKILL.md`
- Modify: `.codex-plugin/plugin.json`
- Create: `test/plugin-skill-contract.test.js`

**Interfaces:**
- Consumes: MCP tools `get_status`, `get_document`, `get_selection`, `create_nodes`, and `update_nodes`, including `expectedContext`.
- Produces: explicitly named Skill `layntra`; read-only intents `status|inspect|review|plan`; write intents `create|apply|refine`; plan state expressed in the same Codex task.

- [ ] **Step 1: Write the failing Skill policy test**

```js
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
```

Also assert plugin metadata uses name, display name, and MCP server `layntra`,
and that every default prompt begins with `$layntra`.

- [ ] **Step 2: Run and confirm the test fails**

Run: `node --test test/plugin-skill-contract.test.js`

Expected: failure on the old Skill name and implicit plain-language workflow.

- [ ] **Step 3: Rewrite the core Skill as a state machine**

The Skill must instruct Codex to:

```text
activation -> status/context -> read-only inspection -> plan
           -> explicit user approval -> guarded write -> re-read verification
```

It must define target resolution (`selection`, read-only `page`, or
`new-frame`), the exact read-only guarantee, latest-plan scope, stale-context
failure, unsupported deletion, bounded batches, partial-failure reporting, and
Undo. It must never claim success from intent alone.

- [ ] **Step 4: Make poster behavior opt-in**

Rename the example Skill to `poster-example`, require an explicit poster/event
request plus `$layntra`, and refer to the core policy rather than redefining
transport or confirmation rules.

- [ ] **Step 5: Replace public Codex metadata**

Use plugin name `layntra`, display name `Layntra`, developer
`Layntra contributors`, category `Productivity`, capability `Write`, version
`0.1.0`, and controlled default prompts such as:

```json
[
  "$layntra status",
  "$layntra inspect selection — do not modify Figma",
  "$layntra plan selection — improve hierarchy without changing copy"
]
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test && git diff --check`

Expected: the Skill contract and bridge suites pass.

```bash
git add .codex-plugin/plugin.json skills test/plugin-skill-contract.test.js
git commit -m "feat: add controlled Layntra Codex workflow"
```

---

### Task 5: Build the bilingual Figma companion UI

**Files:**
- Modify: `apps/figma-plugin/manifest.json`
- Modify: `apps/figma-plugin/ui.html`
- Create: `test/plugin-ui.test.js`

**Interfaces:**
- Consumes: loopback WebSocket at `ws://localhost:3846` and hello client `layntra-figma`.
- Produces: visible states `connecting`, `connected`, and `disconnected`; language control `中文 | English`; exact activation example `$layntra status`.

- [ ] **Step 1: Write the failing UI contract test**

```js
test("Figma companion is bilingual and teaches explicit activation", async () => {
  const html = await readFile("apps/figma-plugin/ui.html", "utf8");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /Layntra for Figma/);
  assert.match(html, /\$layntra status/);
  assert.match(html, /中文/);
  assert.match(html, /English/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /client: "layntra-figma"/);
  assert.doesNotMatch(html, /直接描述你想完成的设计/);
});
```

Assert manifest name `Layntra for Figma`, main/UI relative paths, editor type
`figma`, dynamic-page access, and only localhost loopback domains.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test test/plugin-ui.test.js`

Expected: failure on old name, implicit prompt, and missing English view.

- [ ] **Step 3: Implement accessible language switching and states**

Use one semantic button group to switch strings without reloading. Persist the
choice only in the UI session. Both languages must state:

```text
Connected / 已连接
Keep this window open / 保持此窗口打开
Return to Codex and enter: $layntra status
Layntra will show the target and plan before making changes.
```

On disconnect, show the Codex plugin reinstall/refresh direction and continue
bounded two-second reconnection. Keep visible focus, status announcements,
44-pixel primary controls, 200% zoom behavior, and reduced-motion support.

- [ ] **Step 4: Remove the poster form from the default companion surface**

The poster example remains a Codex Skill. The Figma status companion should not
show guest-photo or event-detail fields that make the core product look like a
poster application.

- [ ] **Step 5: Run checks and commit**

Run: `npm run check && node --test test/plugin-ui.test.js`

Expected: syntax and UI contract pass.

```bash
git add apps/figma-plugin test/plugin-ui.test.js
git commit -m "feat: add bilingual Layntra Figma companion"
```

---

### Task 6: Replace installation with one bilingual, clean-room-tested path

**Files:**
- Move and modify: `scripts/install-codex-plugin.sh` → `scripts/install.sh`
- Create: `test/install.test.js`
- Create: `docs/en/migration.md`
- Create: `docs/zh-CN/migration.md`

**Interfaces:**
- Consumes: `codex plugin marketplace list`, `codex plugin marketplace add <repo>`, and `codex plugin add layntra@layntra`.
- Produces: idempotent `./scripts/install.sh`; nonzero exit for Node below 20, missing Codex, or conflicting marketplace path.

- [ ] **Step 1: Write isolated installer tests**

Create a temporary `bin` containing fake `node` and `codex` executables, prepend
it to `PATH`, and spawn `bash scripts/install.sh`. Cover:

```js
assert.equal(success.status, 0);
assert.match(success.stdout, /Layntra/);
assert.match(codexLog, /plugin marketplace add/);
assert.match(codexLog, /plugin add layntra@layntra/);
assert.match(success.stdout, /apps\/figma-plugin\/manifest\.json/);
assert.match(success.stdout, /\$layntra status/);
```

Separate cases assert idempotent existing registration, Node 18 rejection,
missing Codex rejection, and a conflicting marketplace path that is reported
without overwriting configuration.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test test/install.test.js`

Expected: failure because the new path and Layntra commands do not exist.

- [ ] **Step 3: Implement the installer**

First run:

```bash
git mv scripts/install-codex-plugin.sh scripts/install.sh
```

Keep `set -euo pipefail`, resolve the repository from the script location,
require Node 20+, require `codex`, register marketplace `layntra`, install
`layntra@layntra`, and print the exact Figma manifest path plus `$layntra
status`. Detect an existing old installation but do not remove it silently.

Support `LAYNTRA_LANG=zh-CN` and `LAYNTRA_LANG=en`; default to the system locale
when it begins with `zh`, otherwise English.

- [ ] **Step 4: Write paired migration guides**

Both guides must cover inspection, removal of old `ai-poster-assistant` and
`figma-local-mcp` registrations using documented Codex commands, installation
of Layntra, Figma manifest re-import, new-task refresh, and rollback to the last
local commit. Do not embed an absolute filesystem path.

- [ ] **Step 5: Run tests and commit**

Run: `node --test test/install.test.js && bash -n scripts/install.sh`

Expected: all installer cases pass and Bash syntax is valid.

```bash
git add scripts/install.sh test/install.test.js docs/en/migration.md docs/zh-CN/migration.md
git commit -m "feat: add one-command Layntra installer"
```

---

### Task 7: Write the bilingual product-manager onboarding

**Files:**
- Rewrite: `README.md`
- Create: `README.zh-CN.md`
- Create: `docs/en/getting-started.md`
- Create: `docs/zh-CN/getting-started.md`
- Create: `docs/en/product-manager-playbook.md`
- Create: `docs/zh-CN/product-manager-playbook.md`
- Create: `docs/en/troubleshooting.md`
- Create: `docs/zh-CN/troubleshooting.md`
- Remove after content migration: `docs/GETTING_STARTED.zh-CN.md`

**Interfaces:**
- Consumes: `./scripts/install.sh`, Figma manifest path, and the `$layntra` intent contract.
- Produces: literal five-minute English and Chinese first-success flows with matching headings and command blocks.

- [ ] **Step 1: Add a documentation parity test**

Create `test/docs-contract.test.js` that reads every English/Chinese pair and
asserts both contain these stable tokens:

```js
const required = [
  "$layntra status",
  "$layntra plan",
  "$layntra apply",
  "apps/figma-plugin/manifest.json",
  "Plugins → Development",
  "Command + Z"
];
```

Assert README links resolve to existing local files and that neither README
leads with `MCP`, `WebSocket`, `JSON`, or `API token` before the quick start.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test test/docs-contract.test.js`

Expected: failure because the paired public documents do not exist.

- [ ] **Step 3: Write the paired five-minute READMEs**

Use this order in both languages: outcome, audience, control model, four-step
install, first controlled run, examples, privacy boundary, supported
environment, troubleshooting link, contribution link. Put architecture after
the beginner flow.

- [ ] **Step 4: Write the literal import guide**

Include: use Figma Desktop; choose a personal Starter workspace if an
organization Dev/Collab/View seat blocks Design plugins; open a Design file;
import `apps/figma-plugin/manifest.json`; run `Layntra for Figma`; leave the
status window open; start a new Codex task; enter `$layntra status`; recognize
connected and disconnected results.

- [ ] **Step 5: Write the product-manager playbook**

Provide complete copyable examples for PRD-to-wireframe, current-selection
review, information hierarchy, default/loading/empty/permission/error/success
states, preserving copy and brand colors, and a plan/apply/verify sequence.
Every write example must show `$layntra plan` before `$layntra apply`.

- [ ] **Step 6: Write recovery guides**

Cover bridge unavailable, companion disconnected, port 3846 in use, Dev-seat
restriction, no selection, stale plan, unsupported property, timeout, partial
write, Codex task refresh, and Undo. Diagnostics must be safe and must not kill
unknown processes automatically.

- [ ] **Step 7: Run parity checks and commit**

Run: `node --test test/docs-contract.test.js && git diff --check`

Expected: paired docs exist, links resolve, and required commands match.

```bash
git add README.md README.zh-CN.md docs/en docs/zh-CN test/docs-contract.test.js
git rm docs/GETTING_STARTED.zh-CN.md
git commit -m "docs: add bilingual Layntra onboarding"
```

---

### Task 8: Add open-source governance, CI, and public-data audit

**Files:**
- Modify: `CONTRIBUTING.md`
- Create: `CONTRIBUTING.zh-CN.md`
- Modify: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `CHANGELOG.md`
- Create: `.github/ISSUE_TEMPLATE/bug.yml`
- Create: `.github/ISSUE_TEMPLATE/setup-help.yml`
- Create: `.github/ISSUE_TEMPLATE/feature.yml`
- Create: `.github/pull_request_template.md`
- Create: `.github/workflows/ci.yml`
- Create: `scripts/audit-public.sh`
- Test: `test/public-audit.test.js`

**Interfaces:**
- Consumes: root `npm run verify` and public repository `lessthanno/Layntra`.
- Produces: contributor workflows, supported security channel, CI on Node 20, and a local audit with deterministic exit status.

- [ ] **Step 1: Write the failing public-audit test**

The test spawns `bash scripts/audit-public.sh` and expects exit 0. It also reads
the script and asserts that it checks Git-tracked files for `/Users/`, email
addresses, disposable Figma file IDs, `ai-poster-assistant`, and active
`Figma Local MCP` branding while allowing explicit matches in migration and
historical design documents through a narrow allowlist.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test test/public-audit.test.js`

Expected: failure because the audit script does not exist.

- [ ] **Step 3: Implement the audit with tracked-file input**

Use `git ls-files -z` and `xargs -0 rg` so ignored build artifacts do not affect
results. Exclude `.git`, package lock integrity hashes, approved migration
guides, and the historical design/spec records by exact path. Do not use broad
directory exclusions that could hide a future secret.

- [ ] **Step 4: Add governance files**

Use Contributor Covenant 2.1 for the code of conduct. Contribution guides must
explain architecture boundaries, `bd` tracking for maintainers, tests, real
Figma E2E expectations, bilingual doc parity, DCO/license expectations, and no
personal test data. Security policy must state supported `0.1.x`, loopback
threat boundary, what to report, what evidence to omit, and the repository's
private vulnerability reporting path without publishing a personal email.

- [ ] **Step 5: Add CI**

Use `actions/checkout` and `actions/setup-node` pinned to current major tags,
Node 20, `npm install --ignore-scripts --package-lock=false` at root and
`npm ci --ignore-scripts` in the dependency-free
bridge, then `npm run verify`. Add GitHub's `gitleaks` action or an equivalent
pinned secret scan only after verifying its license and immutable ref. Do not
grant write permissions; set `permissions: contents: read`.

- [ ] **Step 6: Run all gates and commit**

Run: `npm run verify`

Expected: syntax, all unit/integration/contract tests, and public audit pass.

```bash
git add .github CONTRIBUTING.md CONTRIBUTING.zh-CN.md SECURITY.md CODE_OF_CONDUCT.md CHANGELOG.md scripts/audit-public.sh test/public-audit.test.js
git commit -m "chore: prepare Layntra for open-source contributions"
```

---

### Task 9: Verify clean install and real Figma behavior

**Files:**
- Move and rewrite: `docs/e2e-test-report.md` → `docs/testing/e2e-report.md`
- Modify as evidence requires: `docs/en/troubleshooting.md`
- Modify as evidence requires: `docs/zh-CN/troubleshooting.md`

**Interfaces:**
- Consumes: public repository structure, installer, Codex plugin, Figma companion, and controlled Skill.
- Produces: dated public evidence for clean install, explicit activation, read-only guarantee, guarded write, stale-context rejection, editable output, and Undo.

- [ ] **Step 1: Create a clean temporary clone**

Clone the local repository into a `mktemp -d` directory, run `npm run verify`,
and run `./scripts/install.sh` from the clone. Record commands and results
without recording the temporary absolute path.

- [ ] **Step 2: Verify Codex discovery**

Start a new Codex task and confirm plugin metadata shows `Layntra`, the Skill is
invocable as `$layntra`, and the MCP server initializes as `layntra` version
`0.1.0`.

- [ ] **Step 3: Verify the literal Figma import path**

In a disposable personal Starter Design file, import
`apps/figma-plugin/manifest.json`, run `Layntra for Figma`, verify both language
views, and confirm `$layntra status` returns file, page, selection, and connected
state.

- [ ] **Step 4: Verify the read-only contract**

Capture `get_document`, run `$layntra inspect selection` and `$layntra plan`,
then capture `get_document` again. Assert the node hierarchy and properties are
unchanged and the responses say no Figma changes were made.

- [ ] **Step 5: Verify guarded apply and editable output**

Plan a new 390×844 product sign-up frame with default, loading, and error states;
approve with `$layntra apply`; re-read the page; visually confirm individually
editable frame, rectangle, and text layers; record created/updated counts.

- [ ] **Step 6: Verify stale-context and invalid-input behavior**

Create a plan against a selection, change the selection manually in Figma, then
attempt apply. Expected: no write and an instruction to inspect again. Call a
bounded tool with an empty node list. Expected: `isError: true` without bridge
crash.

- [ ] **Step 7: Verify Undo and reconnect**

Use `Command + Z` and confirm the test creation is reverted. Close and reopen
the companion, confirming disconnected guidance and recovery without restarting
Figma.

- [ ] **Step 8: Publish sanitized evidence and commit**

Move the existing report before rewriting it:

```bash
mkdir -p docs/testing
git mv docs/e2e-test-report.md docs/testing/e2e-report.md
```

The report must contain date, versions, pass/fail table, commands, observed
results, and remaining limits. Replace file IDs with `disposable Starter file`
and omit local absolute paths, account email, and unrelated document content.

Run: `npm run verify && git diff --check`

```bash
git add docs/testing/e2e-report.md docs/en/troubleshooting.md docs/zh-CN/troubleshooting.md
git commit -m "test: verify Layntra clean install and Figma workflow"
```

---

### Task 10: Publish the preserved history to `lessthanno/Layntra`

**Files:**
- Modify: `CHANGELOG.md`
- Modify: repository settings through `gh`
- No tag until every preceding gate passes.

**Interfaces:**
- Consumes: clean working tree, passing `npm run verify`, real E2E evidence, and empty public repository `lessthanno/Layntra`.
- Produces: pushed default branch with preserved history, public metadata, and a draft-ready `v0.1.0` changelog entry.

- [ ] **Step 1: Perform final provenance and privacy checks**

Run:

```bash
git status --short
git log --oneline --decorate -10
npm run verify
gh repo view lessthanno/Layntra --json isEmpty,visibility,nameWithOwner
```

Expected: clean tree, full local history visible, every gate passes, and the
target is the intended empty public repository.

- [ ] **Step 2: Create the publishing branch and connect the remote**

```bash
git switch -c codex/layntra-open-source
git remote add origin https://github.com/lessthanno/Layntra.git
git fetch origin
```

If `origin` already exists, verify its exact URL before changing anything.

- [ ] **Step 3: Push the reviewed branch**

```bash
git push -u origin codex/layntra-open-source
```

Expected: the branch appears in the public repository with preserved commits.

- [ ] **Step 4: Configure public repository metadata**

Set description to `Controlled Codex-to-Figma workflows for editable product design.`
and topics `codex`, `figma`, `mcp`, `product-management`, `design-tools`,
`local-first`, and `open-source`. Enable Issues and private vulnerability
reporting. Document manual branch-protection steps if the GitHub plan or API
does not allow them.

- [ ] **Step 5: Open a non-draft pull request for review**

The PR body must link the design, plan, ADR 0003, bilingual quick starts, and
E2E report; list `npm run verify` evidence; and state that `v0.1.0` remains
untagged until the PR is merged and the default-branch smoke test passes.

- [ ] **Step 6: Finish task tracking without premature release claims**

Close the naming/repositioning task and create or close implementation issues
to match actual state. Run `bd sync`, verify `git status`, and push task metadata
if it is tracked. Do not claim a release exists until GitHub shows the tag and
release artifacts.
