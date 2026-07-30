# Figma Local MCP

Open-source local infrastructure that lets anyone describe a design in everyday
language and have Codex build it as editable Figma layers—without a Figma API
token or a hosted MCP subscription.

The integration is local-only: the Figma plugin connects to `ws://127.0.0.1:3846`. It does not use a Figma API token or a cloud MCP service.

> Local-only operating rule: when this plugin is the selected Figma transport,
> create, inspect, and verify designs through this bridge. Do not fall back to
> Figma's hosted MCP tools (including hosted screenshot calls), because those
> are separately metered and can display a plan-limit dialog even though the
> local plugin completed successfully.

## What works today

- Inspect the current page or selection.
- Create editable frames, rectangles, and text layers in batches.
- Update names, position, size, fill, visibility, and text by node ID.
- Load optional Skills for posters and other repeatable workflows.
- Run entirely on the local machine through a loopback-only bridge.

The poster workflow is now an optional example Skill. The core plugin is
general-purpose and does not assume that the user is making a poster.

## Who this is for

You do not need to understand MCP, APIs, JSON, or Figma's developer platform.
Open a file, start the Figma plugin, then describe the result you want in
Codex. See the [Chinese beginner guide](docs/GETTING_STARTED.zh-CN.md).

Figma Design plugins work on a free personal Starter plan or with a Full seat.
An organization-only Dev, Collab, or View seat cannot run plugins in Figma
Design; switch to a personal Starter workspace for the free path.

## Install the Figma plugin

1. Open the target design file in **Figma Desktop**.
2. Choose **Plugins → Development → Import plugin from manifest…**.
3. Select this repository's `manifest.json`.
4. Run **Plugins → Development → Figma Local MCP** and leave its status window open.

## Install the Codex plugin

From this repository, run:

```bash
./scripts/install-codex-plugin.sh
```

The installer checks Codex and Node.js, registers this repository as the
`figma-local-mcp` marketplace, and installs the Codex plugin. Start a new Codex
task afterward so the new Skill and tools are loaded.

> Inspect my current Figma page, then create an editable 1200×630 launch card
> with a dark background, headline, subtitle, and CTA.

If anything is unclear, ask Codex:

> 检查 Figma Local MCP 是否准备好了，并告诉我下一步。

## Architecture

```text
Codex ──stdio/MCP──> local Node bridge ──WebSocket──> Figma plugin UI
                                                        │
                                                        └── Figma Plugin API
```

## Development checks

```bash
node --check code.js
npm --prefix plugins/ai-poster-assistant/mcp-bridge run check
npm --prefix plugins/ai-poster-assistant/mcp-bridge test
```

## Security and privacy

The bridge binds to `127.0.0.1` only. Generic operations are constrained to 100
nodes per request and four inspection levels. Arbitrary code execution and
remote deletion are intentionally out of scope. See [SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [roadmap](docs/roadmap.md).

## License

[MIT](LICENSE)
