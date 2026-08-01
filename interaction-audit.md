# Homepage interaction audit

## Scope

- Goal: let a technical visitor identify Layntra and reach the release or installation guide immediately.
- Desktop evidence: `artifacts/interaction-audit/11-mcp-clean-home.png`.
- Mobile evidence: `artifacts/interaction-audit/12-mcp-clean-mobile.png`.

## Verified flow

1. The first screen identifies Layntra as a local MCP plugin for Codex ↔ Figma.
2. Download v0.1.0 and Install in Codex are visible without scrolling.
3. How it works, Install, Docs, GitHub, and Download remain available in navigation.
4. The mobile menu opens, updates `aria-expanded`, and fits within a 390 px viewport.
5. The removed interactive simulation is no longer present in the DOM or public contract tests.
6. Installation retains the real Figma Desktop manifest-import path and release link.

## Result

The reduced interaction model matches the owner's intended audience: technical users get the product category and entry actions immediately; beginner setup detail remains available without dominating the first screen.
