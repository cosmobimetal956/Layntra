---
name: ai-poster-assistant
description: Apply the optional event-poster example tools included with Figma Local MCP. Use only when the user explicitly asks to create or update a poster, speaker portrait, event date, or poster template.
---

# Poster Examples for Figma Local MCP

This is an optional example workflow built on top of Figma Local MCP. It is not
the core product and must not trigger for general Figma editing.

## Before using a tool

Ask the user to open the target Figma file in Figma Desktop and run **AI Poster Assistant** from **Plugins → Development**. The plugin window must stay open while commands run.

If a tool reports that the Figma plugin is not connected, explain that the local Figma plugin needs to be started and do not retry until the user confirms it is open.

## Poster tools

- `list_templates`: inspect editable poster templates on the current page.
- `replace_guest_photo`: replace every layer named `PHOTO / Replace speaker portrait` with a supplied local image.
- `set_event_details`: update named guest, date, time, or combined date-time layers. Only supply fields the user explicitly wants changed.
- `create_waic_template`, `create_crossborder_template`, `place_guest_asset`, and the `redesign_crossborder_*` tools: create or transform poster layouts on the active page.

## Safe workflow

1. Confirm the user has the intended Figma file and page open.
2. Call `get_document` or `get_selection` before an ambiguous change.
3. For image changes, use an absolute local image path and confirm the file exists first.
4. Re-inspect the affected nodes and report what changed.
