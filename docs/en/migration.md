# Migrate to Layntra

Layntra replaces the development names `ai-poster-assistant` and
`figma-local-mcp`. Migration does not change your Figma documents.

## 1. Inspect the old installation

```bash
codex plugin marketplace list
codex plugin list
```

If the old plugin is installed, remove only its known selectors:

```bash
codex plugin remove ai-poster-assistant@figma-local-mcp
codex plugin marketplace remove figma-local-mcp
```

Do not remove other marketplaces or plugins.

## 2. Install Layntra

From the repository root:

```bash
./scripts/install.sh
```

In Figma Desktop, open a Design file and choose **Plugins → Development →
Import plugin from manifest…**. Select `apps/figma-plugin/manifest.json`, then
run **Plugins → Development → Layntra for Figma** and keep the window open.

Start a new Codex task and enter:

```text
$layntra status
```

Verify the controlled workflow with a disposable selection:

```text
$layntra plan selection
Do not change copy or delete nodes.
```

Approve only after reviewing the target:

```text
$layntra apply
```

If the result is unexpected, return to Figma and press `Command + Z`. The
companion remains available under **Plugins → Development**, and its public
path is `apps/figma-plugin/manifest.json`.

## Roll back

Before the public `v0.1.0` release, the previous local Git commit remains the
rollback source. Switch to the previous verified commit, re-import its manifest,
and reinstall its Codex plugin. Figma document data does not require migration.
