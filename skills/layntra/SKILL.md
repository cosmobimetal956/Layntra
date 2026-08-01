---
name: layntra
description: Controlled Codex-to-Figma workflow for inspecting, planning, creating, and refining editable product designs. Use only when the user explicitly invokes $layntra.
---

# Layntra

Layntra is an explicit, controlled Codex workflow. Never auto-activate from an
ordinary design request. The user starts it with `$layntra` and always knows the
target, mode, and write boundary.

Use only the local Layntra MCP server. Do not switch to hosted Figma tools unless
the user explicitly requests a different transport.

## Intents

Read-only intents never change Figma:

- `status`: call `get_status`; show bridge, companion, file, page, selection,
  target, and mode.
- `inspect`: read the explicit selection or current page.
- `review`: inspect and evaluate against the user's criteria.
- `plan`: inspect, propose bounded changes, and wait for approval.

End every read-only response with: `No Figma changes made / 尚未修改 Figma`.

Write intents are controlled:

- `create`: plan new content with target `new-frame`, then wait.
- `refine`: inspect and plan changes to target `selection`, then wait.
- `apply`: execute only the latest unexecuted plan in this Codex task.
- `undo`: undo only the latest successful Layntra apply from this Codex task.

`create` and `refine` do not write when first requested. They enter plan mode.

## Target resolution

Use exactly one target:

- `selection`: only current selected nodes and descendants.
- `page`: read-only review in version 0.1.0.
- `new-frame`: a new top-level frame; default for new content or ambiguity.

Never infer permission to change the whole page. Never delete, replace, or hide
existing work when the target is ambiguous.

## Controlled state machine

### 1. Connect and capture context

Call `get_status`. If the companion is not connected, give only the next action:
open the intended Design file and run **Plugins → Development → Layntra for
Figma**. Do not pretend the document is available.

For `selection`, call `get_selection`. For `page` or `new-frame`, call
`get_document`. Capture:

```json
{
  "pageId": "current page ID",
  "selectionIds": ["sorted current selection IDs"]
}
```

This is the plan's `expectedContext`. Do not expose node IDs unless needed for
diagnosis.

### 2. Present the plan

State:

- connected file and page;
- target and selected node count;
- nodes and properties to create or update;
- copy, colors, and nodes that will be preserved;
- unsupported or risky parts;
- approximate node count;
- confirmation instruction: `$layntra apply`.

Store the plan only in this Codex task. A newer plan replaces the older one.
Never write while presenting a plan. End with `No Figma changes made / 尚未修改
Figma`.

### 3. Require explicit approval

Accept `$layntra apply` only when an unexecuted plan exists in the same task.
If the command is ambiguous, the plan is missing, or the user changed the goal,
inspect and present a new plan instead.

Pass `expectedContext` to every `create_nodes` or `update_nodes` call. If Figma
reports that its context changed, stop without retrying and ask the user to run
`$layntra plan` again.

Use batches of at most 100 editable `FRAME`, `RECTANGLE`, and `TEXT` nodes. Use
semantic layer names. Do not call deletion or arbitrary-code tools.

### 4. Verify observed results

After a successful write, call `get_document` or `get_selection` again. Report
only what the tool result proves:

- target changed;
- nodes created and updated;
- preserved constraints verified;
- partial or skipped work;
- recovery: enter `$layntra undo` immediately; after closing the companion,
  Figma's `Command + Z` and version history remain manual fallbacks.

Store the observed post-apply page and selection as the recovery context. Accept
`$layntra undo` only for the latest successful apply in this Codex task and only
before any newer Layntra plan or apply. Pass that recovery context to
`undo_last`, then inspect again. If the context changed, stop without undoing;
never guess which history entry belongs to Layntra.

Never claim success from a proposed plan or a tool call that returned an error.
Do not automatically retry a timed-out write.

## Product-manager examples

```text
$layntra status
```

```text
$layntra review selection
Check information hierarchy and missing loading, empty, and error states.
Do not modify Figma.
```

```text
$layntra plan selection
Goal: clarify the login card hierarchy.
Preserve: all copy and brand colors.
Do not: delete or add illustration layers.
```

```text
$layntra create
Target: new-frame
Create a 390 × 844 sign-up screen with default, loading, and validation-error states.
```

```text
$layntra apply
```

```text
$layntra undo
```
