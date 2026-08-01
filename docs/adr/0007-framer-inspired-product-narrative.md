# ADR 0007: Framer-inspired product narrative for the public site

- Status: Accepted
- Date: 2026-08-01
- Owner: Haozi

## Context

The previous homepage exposed the complete Layntra control model inside the hero. Although the simulation was accurate, a first-time visitor had to understand Figma panels, target state, four workflow stages, and guard controls before they understood the product. The page looked like a software control panel and made the core promise harder to grasp.

The current Framer homepage demonstrates a clearer product-marketing hierarchy: a short positioning statement, a small number of conversion actions, a dominant product scene, progressively disclosed capability sections, concrete platform details, and a final call to action. It uses the product itself as the visual proof instead of explaining every control above the fold.

## Decision

Rebuild the Layntra homepage around the same product-design principles while keeping all Layntra branding, copy, imagery, and implementation original.

1. Lead with the product's role: Layntra connects Codex to Figma through MCP.
2. Keep the homepage to that role, primary actions, installation, and the footer. Remove the interactive simulation, integration-name strip, feature cards, control-model section, platform grid, and repeated final CTA.
3. Retain the real Figma import-path screenshot because installation is the only workflow that still needs visual explanation.
4. Retain crawlable safety, permissions, release, source, and installation facts without expanding them into marketing sections.
5. Preserve a static, dependency-free GitHub Pages build with a working mobile menu and reduced-motion support.

The Framer site is a structural and interaction reference only. Layntra does not copy Framer trademarks, copy, customer examples, source assets, or proprietary code.

## Consequences

- The previous browser-only demo state reducer and its tests are removed with the discarded simulation.
- The public site uses a dark, typography-led system with one sans-serif family, a single blue accent, and no decorative product showcase.
- The installation screenshot remains a versioned project asset and must be included in public-audit checks.
- Desktop and mobile QA checks hierarchy, spacing, overflow, installation clarity, and the mobile navigation state.

## Superseded decisions

This ADR supersedes the public-site visual direction in ADR 0005 and the hero-composition decision in ADR 0006. ADR 0006 remains authoritative for the controlled state model, stale-selection guard, progressive enhancement, and accessibility requirements.

## Rollback

Revert the homepage, stylesheet, demo script, design-contract tests, and this ADR together. Routes, release links, GEO files, installation documentation, and the Layntra runtime remain unchanged.
