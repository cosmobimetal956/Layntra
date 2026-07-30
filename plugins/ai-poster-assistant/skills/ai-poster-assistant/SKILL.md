---
name: ai-poster-assistant
description: Inspect and edit the user's currently open Figma Desktop file through a local bridge. Use for reading selections, creating editable layouts, updating nodes, or applying the included event-poster helpers.
---

# Figma Local MCP

This plugin controls only the Figma Desktop file that the user has open through a local WebSocket bridge. It does not use a Figma API token or send design data to a cloud service.

## Before using a tool

Ask the user to open the target Figma file in Figma Desktop and run **AI Poster Assistant** from **Plugins → Development**. The plugin window must stay open while commands run.

If a tool reports that the Figma plugin is not connected, explain that the local Figma plugin needs to be started and do not retry until the user confirms it is open.

## Available tools

- `get_document`: inspect a bounded tree on the current page.
- `get_selection`: inspect the selected nodes and bounded descendants.
- `create_nodes`: create up to 100 editable frames, rectangles, or text nodes.
- `update_nodes`: update common properties by node ID without deleting nodes.
- `list_templates`: inspect editable poster templates on the current page.
- `replace_guest_photo`: replace every layer named `PHOTO / Replace speaker portrait` with a supplied local image.
- `set_event_details`: update named guest, date, time, or combined date-time layers. Only supply fields the user explicitly wants changed.
- `create_waic_template`, `create_crossborder_template`, `place_guest_asset`, and the `redesign_crossborder_*` tools: create or transform poster layouts on the active page.

## Safe workflow

1. Confirm the user has the intended Figma file and page open.
2. Call `get_document` or `get_selection` before an ambiguous change.
3. For image changes, use an absolute local image path and confirm the file exists first.
4. Re-inspect the affected nodes and report what changed.
