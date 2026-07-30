# Figma Local MCP

An open-source, local-first bridge that lets Codex inspect and edit the Figma Desktop file you already have open—without a Figma API token or a hosted MCP subscription.

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
- Keep the original event-poster helpers for existing templates.
- Run entirely on the local machine through a loopback-only bridge.

The public source of truth is `manifest.json`, `code.js`, `ui.html`, and
`plugins/ai-poster-assistant/`. The root `mcp-bridge/` is legacy development
material and will be removed before the first stable release.

## Install the Figma plugin

1. Open the target design file in **Figma Desktop**.
2. Choose **Plugins → Development → Import plugin from manifest…**.
3. Select this repository's `manifest.json`.
4. Run **Plugins → Development → AI Poster Assistant** and leave its window open.

## Install the Codex plugin

1. Add the repository marketplace to Codex:

   ```bash
   codex plugin marketplace add /absolute/path/to/ai-poster-assistant
   ```

2. Install **AI Poster Assistant** from the Codex plugin browser.

There are no runtime npm dependencies. With the Figma plugin open, ask Codex to
inspect the current page, create a layout, or update selected layers.

> Inspect my current Figma page, then create an editable 1200×630 launch card
> with a dark background, headline, subtitle, and CTA.

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
