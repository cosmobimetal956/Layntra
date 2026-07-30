# Contributing

Requirements: Figma Desktop and Node.js 20 or newer.

1. Import `manifest.json` as a Figma Development Plugin.
2. Run the plugin in an open design file.
3. Install the repository marketplace in Codex.
4. Run the checks:

   ```bash
   node --check code.js
   npm --prefix plugins/ai-poster-assistant/mcp-bridge run check
   npm --prefix plugins/ai-poster-assistant/mcp-bridge test
   ```

Keep MCP operations bounded, validate tool inputs, and preserve editable Figma
layers. Destructive operations require design review and explicit confirmation.
