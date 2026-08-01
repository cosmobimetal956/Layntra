# End-to-end test report

- Date: 2026-08-01
- Environment: macOS, Codex Desktop, Figma Desktop 126.7.10
- Workspace: personal Starter team (Free plan)
- Test file: newly created disposable Figma Design file, `eceO8ea18yfB6Ixx52mO0v`

## Result: passed

The complete local production path was exercised against the real Figma plugin
sandbox:

`MCP client → stdio bridge → local WebSocket → Figma plugin → editable canvas`

Verified behavior:

- Imported the repository `manifest.json` as a Figma development plugin.
- Started the local MCP bridge and completed protocol initialization.
- Launched Figma Local MCP and observed its visible `已连接，可以开始` state.
- `get_status` returned `figmaPlugin: connected`.
- `get_document` read the initially empty `Page 1` from the real file.
- `get_selection` read the initial empty selection.
- `create_nodes` created a 720×420 frame and four editable child layers:
  one rectangle and three text layers.
- `update_nodes` changed the title to `周末人文读书会`, renamed two layers,
  and changed the accent fill to `#D95D39` using the returned node IDs.
- A second `get_document` returned the updated hierarchy and values.
- A second `get_selection` returned all four created child layers.
- Figma's Layers panel visibly showed the frame and four individually editable
  children (`Footer`, `Subtitle`, `Title / Updated`, and `Accent / Warm`).
- Invalid input (`create_nodes` with an empty array) returned a bounded MCP tool
  error with `isError: true` instead of hanging or crashing the bridge.

## Supporting automated checks

- Codex marketplace registration and plugin installation
- MCP process startup, initialization, and tool discovery
- Disconnected-state guidance
- Simulated MCP-to-WebSocket round trip and request correlation
- Bounded generic tool schemas

The disposable Starter file was the only Figma document modified during this
test. The earlier Dev-seat restriction remains relevant for organization
workspaces, but it does not block the personal Free-plan workflow documented by
this project.
