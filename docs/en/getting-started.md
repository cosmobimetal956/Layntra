# Getting started

This guide assumes no plugin-development experience.

## Install

1. Install Node.js 20+, Codex Desktop or CLI, and Figma Desktop.
2. Clone Layntra and run `./scripts/install.sh` from the repository root.
3. Open a Design file in Figma Desktop. A personal Starter workspace is the
   free path when an organization Dev/Collab/View seat blocks Design plugins.
4. Choose **Plugins → Development → Import plugin from manifest…**.
5. Select `apps/figma-plugin/manifest.json`.

![Figma menu path: Plugins, Development, Import plugin from manifest](../assets/figma-import-manifest-path.png)

6. Run **Plugins → Development → Layntra for Figma** and keep its status window
   open.
7. Start a new Codex task so the installed plugin is loaded.

## Confirm the connection

```text
$layntra status
```

The response should show `connected`, the file, page, selection, and read-only
mode. If it does not, use the troubleshooting guide before continuing.

## Inspect without writing

Select one frame in Figma, then enter:

```text
$layntra inspect selection
Do not modify Figma.
```

The response ends with `No Figma changes made`.

## Create the first controlled frame

```text
$layntra plan
Target: new-frame
Create a 390 × 844 sign-up screen with default, loading, and error states.
Preserve all existing nodes.
```

Review the named target, proposed nodes, preserved content, and node count. No
write has occurred yet. Approve only if it is correct:

```text
$layntra apply
```

Confirm that Figma shows individually editable layers. Layntra must re-read and
report the observed result. Enter `$layntra undo` immediately to verify guarded
recovery, then confirm that Layntra re-read the reverted document. After closing
the companion, Figma's `Command + Z` remains a manual fallback.

The companion manifest remains at `apps/figma-plugin/manifest.json`, and its
runtime menu remains **Plugins → Development → Layntra for Figma**.
