# Layntra

**Turn product ideas into editable Figma designs—with an explicit plan before
anything changes.**

Layntra is a Codex plugin for product managers and other non-developers. Invoke
`$layntra`, choose the target, review the plan, and apply only when you are
ready. Every result remains editable in Figma.

[简体中文](README.zh-CN.md)

**Website:** [lessthanno.github.io/Layntra](https://lessthanno.github.io/Layntra/)

## Download

**[Download Layntra v0.1.0](https://github.com/lessthanno/Layntra/releases/tag/v0.1.0)**

On the release page, download `layntra-figma-plugin.zip` under **Assets**, then
unzip it—do not import the ZIP itself. Follow step 4 below to choose the included
plugin file. This download is the Figma side of Layntra; the Codex plugin is
installed in step 1 below.

## Quick start

Requirements: macOS, Node.js 20+, Codex Desktop or CLI, and Figma Desktop. Use a
personal Starter workspace if an organization Dev/Collab/View seat cannot run
Design plugins.

1. Clone this repository and run `./scripts/install.sh` to install the Codex
   plugin.
2. Download and unzip the **Figma companion** using the button above.
3. Open a Design file in Figma Desktop.
4. Choose **Plugins → Development → Import plugin from manifest…** and select
   `layntra-figma-plugin/manifest.json` from the unzipped download. If you cloned
   the repository, `apps/figma-plugin/manifest.json` is the same plugin.

![Figma menu path: Plugins, Development, Import plugin from manifest](docs/assets/figma-import-manifest-path.png)

5. Run **Plugins → Development → Layntra for Figma** and keep its window open.
6. Start a new Codex task and enter:

```text
$layntra status
```

Then inspect without writing:

```text
$layntra review selection
Check hierarchy and missing loading, empty, and error states.
Do not modify Figma.
```

Plan and apply separately:

```text
$layntra plan selection
Improve hierarchy. Preserve all copy and brand colors.
```

```text
$layntra apply
```

Layntra re-reads the result after writing. To recover immediately, enter
`$layntra undo`; it refuses if the Figma target changed after the apply.

## Why the explicit command?

Ordinary conversation is not a reliable control surface. `$layntra` makes the
active plugin, file, page, selection, mode, and write boundary visible. Read-only
intents never modify Figma; write intents wait for your approval.

## Guides

- [Getting started](docs/en/getting-started.md)
- [Product manager playbook](docs/en/product-manager-playbook.md)
- [Troubleshooting](docs/en/troubleshooting.md)
- [Migration from the development version](docs/en/migration.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Architecture and privacy

```text
Codex Skill → local stdio/MCP bridge → loopback WebSocket → Figma companion
```

The bridge binds to `127.0.0.1:3846`. Layntra needs no Figma API token, hosted
Layntra account, or telemetry. Codex model data handling remains governed by
your Codex configuration; “local bridge” does not mean the AI model is offline.

Writes are limited to supported editable nodes and batches of at most 100.
Deletion and arbitrary code execution are not exposed in `v0.1.0`.

## Development

```bash
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture and test expectations.

## License

[MIT](LICENSE)
