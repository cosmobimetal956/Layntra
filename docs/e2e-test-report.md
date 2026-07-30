# End-to-end test report

- Date: 2026-07-30
- Environment: macOS, Codex Desktop, Figma Desktop 126.7.10
- Test file: newly created disposable Figma Design draft

## Passed

- Codex marketplace registration and plugin installation
- MCP process startup and initialization
- Tool discovery, including `get_status`
- Disconnected-state guidance
- Full simulated round trip:
  `MCP client → local bridge → WebSocket plugin client → result → MCP client`
- Request correlation and bounded generic tool schemas
- Updated Figma Desktop installation and launch
- Creation of an isolated blank Design file

## Blocked in the real Figma sandbox

Importing `manifest.json` displayed:

> Request Figma Design to manage plugins and widgets

The active SUNAI LLC account has a Dev seat. Figma's current plugin matrix does
not permit Dev, Collab, or View seats to run plugins in Figma Design. Sending
the access request could create a paid Full seat, so the test stopped without
submitting it.

## Required final verification

Switch Figma to a personal Starter workspace or a Full-seat workspace, then:

1. Import `manifest.json`.
2. Run Figma Local MCP.
3. Verify `get_status` returns `connected`.
4. Call `get_document`.
5. Create a frame, rectangle, and text with `create_nodes`.
6. Update text and fill with `update_nodes`.
7. Re-read the page and visually confirm editable layers.

No existing design file was modified during this test.
