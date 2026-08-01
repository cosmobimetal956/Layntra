# End-to-end test report

- Date: 2026-08-01
- Environment: macOS, Codex Desktop, Figma Desktop 126.7.10
- Workspace: editable personal Starter workspace (Free plan)
- Scope: a dedicated empty page; all disposable test layers were removed

## Result: passed

The release candidate completed the real local production path:

`Codex MCP client → stdio bridge → loopback WebSocket → Figma development plugin → editable layers`

## Beginner installation and companion

- Cloned the repository into a clean temporary directory.
- Ran `npm ci`, `npm run verify`, and the real `./scripts/install.sh` flow.
- Confirmed Codex registered the `layntra` marketplace and installed the
  `layntra@layntra` plugin.
- Imported `apps/figma-plugin/manifest.json` through Figma's development-plugin
  flow.
- Launched **Layntra for Figma** and observed the connected state.
- Switched the visible companion from Chinese to English and confirmed the same
  `$layntra status` controlled workflow in both languages.

## Read and write controls

- MCP initialization and tool discovery completed successfully.
- `get_status` returned the connected file, current page, empty selection, and
  a context fingerprint.
- Two consecutive `get_document` calls returned the same empty page, proving the
  status/inspect path did not write.
- `create_nodes` created one editable 390 × 844 frame, one rectangle, and three
  text layers with semantic names.
- `update_nodes` changed the title copy, layer names, and accent fill using the
  returned node IDs.
- A follow-up `get_document` returned the updated editable hierarchy and values.
- Changing the Figma selection after planning caused a stale-context
  `update_nodes` call to fail with `isError: true`; the attempted text did not
  appear in the document.
- Invalid input (`create_nodes` with an empty array) returned a bounded tool
  error instead of hanging or crashing the bridge.

## Recovery and reconnect

- Every successful write now calls `figma.commitUndo()`.
- Generic creation preserves the user's current selection, avoiding a separate
  hidden selection-history step.
- `undo_last` required the observed post-apply page and selection, called
  Figma's undo API, and removed a freshly created frame in one guarded action.
- A second document read proved the undone frame was absent.
- Stopping and restarting the local bridge allowed the open companion to
  reconnect; a new `get_status` call again returned `figmaPlugin: connected`.
- The disposable page was cleaned after the test.

## Automated release gates

`npm run verify` covers syntax checks, protocol startup, simulated
MCP-to-WebSocket round trips, context guarding, bounded schemas, undo wiring,
installer behavior, bilingual documentation, explicit Skill activation, and
the public-data audit.

Organization workspaces can still block Design plugins for Dev, Collab, or View
seats. The documented personal Starter path remained usable without a paid
Design seat.
