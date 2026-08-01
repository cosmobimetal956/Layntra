# ADR 0005: Editorial graphic system for the public website

- Status: Superseded by ADR 0006 for the homepage product surface; visual system remains active
- Date: 2026-08-01
- Owner: Haozi

## Context

The first public Layntra website explained the product accurately, but its dark developer-tool styling made the project feel like a terminal utility. Layntra is intended for product managers and nontechnical builders as well as engineers, so the public website must communicate both control and creative capability without hiding the installation path.

## Decision

Use a light editorial system built around condensed display typography, an ultramarine signal color, a small yellow accent, visible rules, large step numbers, and a generated product-workflow image. Keep the information architecture and factual safety claims intact while replacing rounded cards, neon accents, gradients, and terminal-first presentation.

The homepage keeps two primary conversion actions: download the Figma companion release and install the Codex plugin. The controlled sequence remains visible as `Inspect → Plan → Apply → Undo`, followed by a three-step beginner installation path.

Fonts and the hero asset are self-hosted so the public page has no runtime dependency on third-party font or image services.

## Options considered

1. Keep the dark developer-tool theme and only refine spacing. Rejected because it preserves the original audience and brand mismatch.
2. Use a cinematic, image-led landing page. Rejected because it makes installation and the safety model less scannable.
3. Use a light editorial graphic system. Selected because it is distinctive while keeping the workflow legible for first-time users.

## Consequences

- The visual system is more memorable and better aligned with the project's broader audience.
- Supporting pages inherit the same tokens and typography through the shared stylesheet.
- The generated hero asset becomes a reviewed public artifact and must remain optimized and accessible.
- Design QA must compare the 1440px implementation with the selected option before release.

## Rollback

Revert this ADR and the associated homepage, stylesheet, font, and hero-asset commit. The content and URLs remain compatible, so rollback requires no data or deployment migration.
