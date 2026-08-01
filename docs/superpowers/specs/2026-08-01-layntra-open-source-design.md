# Layntra Open-Source Product Design

- Status: Proposed for implementation
- Date: 2026-08-01
- Product owner: Layntra maintainers
- Repository: `lessthanno/Layntra`
- Initial release: `v0.1.0`

## 1. Product definition

Layntra is a Codex plugin that turns controlled product instructions into
editable Figma designs through a local-only connection.

> Invoke `$layntra`, choose the target, review the plan, then apply.
>
> 用 `$layntra` 明确唤起，选择作用范围，确认计划后再执行。

The product is designed first for product managers, operators, students,
researchers, and other non-developers. Users must not need to understand MCP,
WebSockets, JSON, the Figma Plugin API, or API tokens to reach a successful
result.

Layntra is the Codex plugin. `Layntra for Figma` is its required local canvas
companion, not a separate product and not the primary documentation entry
point.

## 2. User problem and desired outcome

### Problem

Natural-language-only design agents provide weak control. A user cannot easily
tell whether the design plugin is active, which document area will change,
whether a response is only a proposal, or whether a write has already happened.
Technical installation language makes this worse for first-time users.

### Desired outcome

A first-time product manager can:

1. install the Codex plugin and Figma companion from bilingual instructions;
2. explicitly invoke `$layntra`;
3. see the connected file, page, selection, target, and current mode;
4. inspect or plan without changing the document;
5. approve a bounded plan before any write;
6. receive a verified summary and a clear Figma Undo instruction afterward.

The target success measure is that at least four of five first-time,
non-developer testers complete install, connect, inspect, plan, apply, and undo
without developer assistance, with a median completion time under ten minutes.

## 3. Scope

### Initial release

- Codex Desktop and Codex CLI plugin packaging.
- Figma Desktop companion plugin on macOS.
- Personal Figma Starter workspaces and compatible Full-seat workspaces.
- Explicit `$layntra` invocation and controlled intent vocabulary.
- Page and selection inspection.
- Creation of editable frames, rectangles, and text.
- Bounded updates to names, position, size, fill, visibility, and text.
- English and Simplified Chinese onboarding, operating guides, and recovery.
- Product-manager workflows for UI structure, states, hierarchy, and review.
- Local-only bridge with no Figma API token, hosted account, or telemetry.

### Non-goals for `v0.1.0`

- Automatic invocation from an unrelated conversational prompt.
- A custom Codex GUI or invented slash-command system.
- Full Figma Plugin API coverage.
- Silent deletion, destructive replacement, or arbitrary code execution.
- Hosted collaboration, accounts, analytics, or cloud storage.
- Support for non-Codex AI clients.
- Support for design applications other than Figma.
- Figma Community publication before the development-plugin path is stable.

The internal design may preserve extension points, but public documentation must
not advertise unimplemented clients or canvases.

## 4. Controlled interaction contract

`$layntra` is the explicit activation token because it uses the Codex Skill
invocation model. Text following the token is a conversational contract, not a
shell parser. The Skill recognizes a small stable vocabulary and asks a concise
question when required information is missing.

### Read-only intents

The following intents never write to Figma:

- `$layntra status`: report bridge, Figma file, page, selection, target, and
  mode.
- `$layntra inspect selection`: describe the selected hierarchy and nodes.
- `$layntra review selection`: review a selection against user-supplied goals.
- `$layntra plan`: produce a bounded change plan and wait.

Every read-only response states `尚未修改 Figma / No Figma changes made`.

### Write intents

- `$layntra create`: propose and then create a new frame.
- `$layntra apply`: execute the most recently presented plan in the current
  task.
- `$layntra refine`: propose and then update the explicit target.

A write requires all of the following:

1. a connected Figma companion;
2. an explicit target;
3. a concrete plan that lists affected properties and estimated node counts;
4. a user message that explicitly approves that plan;
5. a post-write read that verifies the observed document state.

`$layntra apply` applies only the latest unexecuted plan in the same Codex task.
If the Figma file, page, or selection changed after planning, Layntra stops and
asks the user to review a refreshed plan.

### Targets

- `selection`: only the current Figma selection and its descendants.
- `page`: the current page, allowed only for read-only review in `v0.1.0`.
- `new-frame`: a newly created top-level frame; this is the default for new
  content.

If a requested write does not identify a safe target, Layntra defaults to
`new-frame`. It must not infer permission to modify the entire page.

### Plan response

Before a write, Layntra reports:

- connected file and page;
- target name and node count;
- proposed creations and updates;
- preserved content;
- unsupported or risky requests;
- confirmation phrase: `$layntra apply`.

### Completion response

After a write, Layntra reports observed rather than intended results:

- nodes created and updated;
- target that was changed;
- invariants that were re-read and verified;
- any partial failure;
- `Command + Z` as the immediate Figma recovery action.

Deletion is not exposed in `v0.1.0`. The bridge must keep node-count, inspection
depth, payload-size, and request-time limits.

## 5. First-time user experience

The README is a product entry point, not a protocol manual. Its first screen
answers:

1. What is Layntra?
2. Who is it for?
3. What can a product manager do with it?
4. How do I install it in four steps?
5. What exact command proves it is working?

The first-success path is:

1. Install the Layntra Codex plugin with the documented command.
2. Open a Design file in Figma Desktop.
3. Import `apps/figma-plugin/manifest.json` through
   `Plugins → Development → Import plugin from manifest…`.
4. Run `Plugins → Development → Layntra for Figma` and leave the visible status
   window open.
5. Start a new Codex task so the installed plugin is loaded.
6. Enter `$layntra status`.
7. Enter `$layntra create` with the documented starter brief.
8. Review the proposed target and plan.
9. Enter `$layntra apply`.
10. Confirm that Figma shows individually editable layers, then exercise
    `Command + Z`.

Technical architecture appears after the quick start and in contributor docs.

## 6. Bilingual documentation

English is the canonical source for public contracts and Simplified Chinese is
a first-class maintained translation. Both languages must cover the same user
journey and versioned behavior.

```text
README.md
README.zh-CN.md
docs/en/getting-started.md
docs/zh-CN/getting-started.md
docs/en/product-manager-playbook.md
docs/zh-CN/product-manager-playbook.md
docs/en/troubleshooting.md
docs/zh-CN/troubleshooting.md
docs/en/migration.md
docs/zh-CN/migration.md
```

Each procedure includes exact visible menu labels, commands, expected states,
and recovery steps. Chinese documentation must explain unavoidable English UI
labels instead of silently translating labels that users cannot find in Figma
or Codex.

The product-manager playbook includes:

- turning a product brief into an editable page or wireframe;
- defining default, loading, empty, permission, success, and error states;
- reviewing information hierarchy and spacing without writing;
- preserving copy, brand color, or named layers;
- restricting changes to the current selection;
- comparing the plan with the verified result;
- recovering with Undo and refreshing a stale plan.

## 7. Repository and component design

The public repository uses a modular monorepo with one installation entry point:

```text
Layntra/
├── apps/
│   └── figma-plugin/
├── packages/
│   └── mcp-bridge/
├── skills/
│   ├── layntra/
│   └── poster-example/
├── examples/
├── scripts/
├── docs/
│   ├── en/
│   ├── zh-CN/
│   ├── adr/
│   ├── testing/
│   └── superpowers/specs/
├── .github/
├── README.md
├── README.zh-CN.md
├── CONTRIBUTING.md
├── CONTRIBUTING.zh-CN.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

Responsibilities are separated as follows:

- `skills/layntra`: user intent, control policy, product-manager guidance, and
  tool orchestration.
- `packages/mcp-bridge`: MCP transport, schema validation, local WebSocket
  lifecycle, correlation, timeouts, and stable errors.
- `apps/figma-plugin`: Figma Plugin API adapter, document reads, bounded writes,
  and the visible connection state.
- `poster-example`: an optional example that depends on the core Layntra Skill;
  it must not influence default behavior.

A separate protocol package is deferred until more than one implementation
needs the contract. Creating one for directory symmetry alone would add
maintenance without improving isolation.

## 8. Data flow and trust boundaries

```text
User
  → explicit $layntra Skill
  → local stdio MCP bridge
  → loopback-only WebSocket
  → visible Figma companion
  → current Figma document
```

The Skill treats tool output as untrusted data. The bridge validates every MCP
input, enforces size and count limits, correlates requests, and fails boundedly
on timeout or disconnect. The companion accepts only supported operations and
does not evaluate arbitrary code.

The bridge listens on loopback only. The project uses no Figma API token and
sends no document data to a Layntra-hosted service. Codex model data handling is
outside Layntra's boundary and must be explained accurately rather than called
fully offline.

No secrets, personal filesystem paths, email addresses, test file identifiers,
or organization-specific content may ship in source, examples, fixtures, logs,
or documentation.

## 9. Failure and recovery behavior

Every failure is mapped to a plain-language next step:

- Bridge unavailable: explain how to verify or reinstall the Codex plugin.
- Figma companion disconnected: name the exact Figma menu path to run it.
- Port in use: identify port `3846`, show a safe diagnostic, and avoid killing
  unrelated processes automatically.
- Unsupported organization seat: explain the personal Starter workspace path
  without requesting a paid seat.
- No selection: offer `new-frame` or ask the user to select a target.
- Stale plan: stop before writing and regenerate against current state.
- Unsupported property: report what was skipped before confirmation.
- Partial write: re-read the page, report observed changes, and recommend Undo.
- Timeout: do not retry non-idempotent writes automatically.

The visible Figma companion shows connected, connecting, disconnected, and
recovery states in English and Chinese without requiring developer tools.

## 10. Compatibility and migration

Public branding, Codex plugin metadata, marketplace name, Skill name, MCP server
title, Figma plugin name, package metadata, UI, and documentation become
Layntra.

Existing MCP tool names remain compatible during the first migration. The old
`ai-poster-assistant` and `figma-local-mcp` installation names are removed from
the public happy path and documented only in migration instructions.

Existing local users receive explicit uninstall and reinstall steps. The
repository history is preserved and pushed to `lessthanno/Layntra`; the project
is not republished as a history-free copy.

The architecture rename and controlled interaction contract require an ADR
that supersedes the temporary naming decision in ADR 0002.

## 11. Open-source readiness

The initial public repository includes:

- MIT License;
- English and Chinese contribution guides;
- security policy with private reporting instructions;
- contributor code of conduct;
- issue forms for bugs, setup help, and feature proposals;
- pull request template;
- ownership and release responsibilities;
- GitHub repository description and topics;
- versioned changelog and `v0.1.0` release notes.

CI must run syntax checks, unit and integration tests, package/install checks,
documentation-link checks, secret scanning, and the simulated protocol round
trip. Branch protection and required review are repository settings documented
for the owner to enable if the platform does not permit automation.

## 12. Verification and acceptance

The reorganization is accepted only when all of the following pass:

1. No unintended old-brand references remain outside migration history.
2. No personal path, email, secret, or disposable Figma file ID is present.
3. The Codex plugin installs from the reorganized repository.
4. A new Codex task exposes the `$layntra` Skill and local MCP tools.
5. `$layntra status` reports the real connected file and target.
6. Read-only intents perform no Figma writes.
7. A write plan waits for explicit approval.
8. `$layntra apply` creates or updates only the approved target.
9. The result is re-read and visible as independently editable Figma layers.
10. A stale target prevents execution.
11. Empty, invalid, disconnected, timeout, and bounded-limit cases return safe
    actionable errors.
12. English and Chinese first-success procedures are followed literally on a
    clean installation.
13. Applicable syntax, unit, integration, contract, E2E, install, link, and
    secret checks pass.
14. The default branch is pushed to `lessthanno/Layntra` and the public release
    artifacts refer only to public repository paths.

## 13. Rollout and rollback

Implementation occurs on a `codex/` branch. Before switching the public
repository, the new install flow is tested from a clean temporary directory.
The existing local repository and Git history remain the rollback source.

If the reorganized plugin fails its clean-install or real Figma E2E gate, no
`v0.1.0` tag is created. The branch can be reverted without changing the user's
Figma documents because the protocol does not migrate stored document data.

## 14. Implementation sequence

1. Record the rename and interaction contract in an ADR.
2. Reorganize the repository while preserving behavior and history.
3. Rename product metadata and implement the `$layntra` control policy.
4. Build paired English and Chinese onboarding and product-manager guides.
5. Add open-source governance and CI files.
6. Test clean installation, simulated protocol behavior, and real Figma E2E.
7. Audit for private data and stale branding.
8. Connect and push the repository to `lessthanno/Layntra`.
9. Create `v0.1.0` only after all acceptance gates pass.
