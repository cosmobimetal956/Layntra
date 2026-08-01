---
name: figma-local-mcp
description: Inspect and edit the user's currently open Figma Desktop file through the local Figma Local MCP bridge. Use for general Figma work such as reading a page or selection, creating editable layouts, and updating nodes. Designed for users who describe outcomes in plain language.
---

# Figma Local MCP

Use the local bridge as the default transport for this workflow. Do not switch
to Figma's hosted MCP tools unless the user explicitly asks to.

## Start gently

The user does not need to know MCP terminology. When setup is uncertain:

1. Call `get_status`.
2. If `figmaPlugin` is `not_connected`, give only this instruction:
   open the intended file in Figma Desktop and run
   **Plugins → Development → Figma Local MCP**.
3. Once connected, call `get_selection` when the user refers to selected
   objects; otherwise call `get_document`.

## Design workflow

1. Translate the user's plain-language goal into a small editable structure.
2. Inspect before changing an existing design.
3. Use `create_nodes` in batches of at most 100 frames, rectangles, and text
   layers. Use clear semantic names.
4. Use returned IDs with `update_nodes` for refinements.
5. Re-inspect the affected selection or page and report the outcome in plain
   language.

Never imply that an operation succeeded until the tool returns successfully.
Do not expose internal node IDs unless they help diagnose a problem.

## Safety

- Never add a deletion workflow without explicit user confirmation.
- Preserve existing nodes when a request is ambiguous.
- Keep images and design content local.
- Explain connection failures as a next action, not as a technical stack trace.

## Example requests

- “把我选中的这张卡片排版得更清楚。”
- “做一张可以继续编辑的读书会邀请卡。”
- “先看看这个页面，再帮我统一标题和正文层级。”
