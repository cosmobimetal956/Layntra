# ADR 0007: Framer-inspired product narrative for the public site

- Status: Accepted
- Date: 2026-08-01
- Owner: Haozi

## Context

The previous homepage exposed the complete Layntra control model inside the hero. Although the simulation was accurate, a first-time visitor had to understand Figma panels, target state, four workflow stages, and guard controls before they understood the product. The page looked like a software control panel and made the core promise harder to grasp.

The current Framer homepage demonstrates a clearer product-marketing hierarchy: a short positioning statement, a small number of conversion actions, a dominant product scene, progressively disclosed capability sections, concrete platform details, and a final call to action. It uses the product itself as the visual proof instead of explaining every control above the fold.

## Decision

Rebuild the Layntra homepage around the same product-design principles while keeping all Layntra branding, copy, imagery, and implementation original.

1. Lead with a literal category statement: Layntra is a local MCP plugin for Codex ↔ Figma.
2. Do not place an oversized interactive simulation or integration-name strip above the workflow content. Technical visitors do not need the product category explained through a staged demo.
3. Explain Inspect, Plan, Protect, Apply, and Undo through concise product cards.
4. Use project-owned artwork in product examples and the real Figma import-path screenshot in installation guidance.
5. Retain crawlable installation, safety, permissions, release, and source information.
6. Preserve a static, dependency-free GitHub Pages build with a working mobile menu and reduced-motion support.

The Framer site is a structural and interaction reference only. Layntra does not copy Framer trademarks, copy, customer examples, source assets, or proprietary code.

## Consequences

- The previous browser-only demo state reducer and its tests are removed with the discarded simulation.
- The public site moves from a light editorial system to a dark product-led system with restrained radius, thin borders, one sans-serif family, and a single blue interaction accent.
- Product artwork becomes a versioned project asset and must be included in public-audit checks.
- Desktop and mobile QA must compare the implementation against captured Framer reference views for hierarchy, density, spacing, and interaction rhythm rather than literal content identity.

## Superseded decisions

This ADR supersedes the public-site visual direction in ADR 0005 and the hero-composition decision in ADR 0006. ADR 0006 remains authoritative for the controlled state model, stale-selection guard, progressive enhancement, and accessibility requirements.

## Rollback

Revert the homepage, stylesheet, demo script, design-contract tests, and this ADR together. Routes, release links, GEO files, installation documentation, and the Layntra runtime remain unchanged.
