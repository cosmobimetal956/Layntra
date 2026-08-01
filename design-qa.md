# Design QA — minimal MCP homepage

final result: passed

## Target

- One job: explain that Layntra connects Codex to Figma through MCP.
- Keep only primary actions, installation, and the footer.
- Retain the established black typography-led design and the real Figma import screenshot.

## Acceptance checks

- No interactive demo, integration strip, feature cards, platform grid, or repeated final CTA.
- One H1, direct MCP copy, release link, GitHub link, and install path.
- Desktop and 390 px layouts must have no horizontal overflow.
- Mobile menu must remain keyboard-operable and expose its expanded state.

## Browser verification

- Desktop, 1440 × 900: one H1, complete install image, and no removed marketing sections; `scrollWidth` equals `innerWidth`.
- Mobile, 390 × 844: no horizontal overflow; the menu opens and changes `aria-expanded` from `false` to `true`.
- Captures: `artifacts/interaction-audit/18-mcp-role-desktop-final.png` and `artifacts/interaction-audit/19-mcp-role-mobile-final.png`.
