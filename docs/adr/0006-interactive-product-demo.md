# ADR 0006: Product-led interactive Figma demo

- Status: Accepted
- Date: 2026-08-01
- Owner: Haozi

## Context

The editorial redesign made Layntra visually distinctive, but the homepage still behaved like a presentation. The hero used a static workflow image and the following sections repeated the same sequence in large typographic blocks. A first-time product manager could understand the promise, but could not experience the control boundary that differentiates Layntra.

## Decision

Turn the homepage hero into a self-contained product simulation. The simulation uses the familiar structure of a Figma workspace—layers, canvas, selection, and properties—paired with a Codex command surface. Visitors can move through `Inspect → Plan → Apply → Undo`, see editable design elements change, deliberately make the selection stale, and observe Layntra block the write.

The simulation is local and deterministic. It does not connect to Figma, execute user code, persist input, or send telemetry. The UI states are driven by a small pure state reducer with progressive enhancement, keyboard-operable controls, polite status announcements, and reduced-motion support.

The option 3 editorial system remains the visual source of truth. The large condensed typography, warm paper, ultramarine, signal yellow, black rules, and square geometry frame the product surface instead of replacing it.

## Options considered

1. Add scroll animation to the existing static sections. Rejected because motion would decorate the presentation without making the product understandable.
2. Embed a prerecorded video. Rejected as the primary experience because it is passive, heavier, and cannot demonstrate the stale-selection guard through user action.
3. Build an interactive product simulation. Selected because the user can see and test the exact workflow without connecting a real file.

## Consequences

- The homepage gains a small local JavaScript module and must remain useful when JavaScript is unavailable.
- Interaction state becomes a public product contract covered by unit and browser tests.
- The long marketing sequence is reduced; installation and safety facts remain crawlable below the demo.
- The simulation must be clearly labelled so visitors do not mistake it for a live Figma connection.

## Rollback

Revert this ADR and the interactive-homepage commit. The previous static hero asset can be restored without changing routes, release links, installation docs, or the local Layntra runtime.
