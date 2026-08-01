# Design QA — Interactive Figma product demo

final result: passed

## Comparison setup

- Source visual truth: `dist/design-references/selected-option-3.png` (748 × 2103 px).
- Desktop entry implementation: `artifacts/interaction-audit/02-interactive-home.png` (1440 × 1000 px), 1440 × 1000 CSS-pixel viewport, DPR 1.
- Guard failure state: `artifacts/interaction-audit/03-stale-selection-blocked.png` (1440 × 1000 px), same viewport and density.
- Successful apply state: `artifacts/interaction-audit/04-applied.png` (1440 × 1000 px), same viewport and density.
- Mobile entry and plan states: `artifacts/interaction-audit/05-mobile-home.png` and `artifacts/interaction-audit/06-mobile-plan.png` (390 × 844 px), 390 × 844 CSS-pixel viewport, DPR 1.
- Install and final CTA regions: `artifacts/interaction-audit/08-install.png` and `artifacts/interaction-audit/09-final.png` (1440 × 1000 px).
- Combined comparison input: `artifacts/interaction-audit/10-design-qa-comparison.png`.
- State: anonymous public homepage, self-hosted fonts loaded, local JavaScript module loaded, simulated companion connected.
- Density normalization: the 748 px source and 1440 px implementation captures were scaled to a common comparison board. Focused implementation states remain at native DPR 1.

The in-app browser's native full-page stitching produced an invalid narrow render for this long page. Full-view QA therefore uses a comparison board assembled from accepted native viewport captures of the entry, demo state, install section, and final CTA. Each source capture was opened and inspected before inclusion.

## Findings

No actionable P0, P1, or P2 findings remain.

- **Fonts and typography:** Barlow Condensed retains the tall editorial display voice while Inter and the system mono stack carry product UI at readable sizes. The hero is deliberately shorter than the source so the working canvas appears in the first viewport.
- **Spacing and layout rhythm:** the warm-paper grid, hard rules, square controls, large type, and blue offset edge preserve option 3. The new workspace uses a familiar layers → canvas → properties structure, then places the Codex command and status directly below it.
- **Colors and visual tokens:** warm white, black, ultramarine, signal yellow, and orange focus/error preview states map to the source. State meaning is also written in text, not encoded by color alone.
- **Image quality and assets:** the old generated hero raster was removed from the primary experience. The replacement is functional product UI, not CSS art standing in for an illustration. There are no placeholder images, fake avatars, inline SVGs, custom icon drawings, gradients, or third-party runtime assets.
- **Copy and content:** command, selection, target, node count, local endpoint, apply result, and undo result are concrete and consistent with Layntra's real control model. The simulation disclosure prevents visitors from mistaking the page for a live Figma connection.
- **States and behavior:** Inspect, Plan, Apply, Undo, stale selection, blocked apply, re-inspection, successful write, reset, disabled prerequisites, and read-back status are present. Plan/apply/undo are not static chrome.
- **Responsiveness:** desktop and 390 px mobile captures have no page-level horizontal overflow. On mobile, the workflow stepper scrolls inside its own bounded region and the canvas remains the primary surface.
- **Accessibility:** native buttons, pressed and disabled states, labelled regions, a polite live status, blocking alert, skip link, 3 px focus treatment, reduced-motion CSS, and mobile-sized primary controls are present. The main interaction works without pointer-specific markup.
- **Icons:** the simulation avoids a decorative icon set; text labels are used where they are clearer and closer to the product model.

## Interaction verification

1. Opened Plan from the Inspect state; the command, dashed change preview, status, and enabled controls updated.
2. Changed the Figma selection from Frame 12 to Frame 13 after planning; selection and target visibly diverged.
3. Attempted Apply; the write remained blocked and the alert requested re-inspection.
4. Re-inspected Frame 13, planned again, and applied; only Frame 13 changed while Frame 12 retained its original yellow design.
5. Undid the write; Frame 13 returned to its original surface and the status reported verified restoration.
6. Verified native step buttons, focus outline, disabled prerequisites, live-region markup, desktop/mobile reflow, and local/release links.
7. Browser console warnings/errors: none.

## Comparison history

1. **P1 — product experience:** the previous homepage used a static workflow image and repeated the workflow as large sections, making the product feel like a presentation. Fixed by replacing the hero image with the interactive Figma workspace and reducing the repeated marketing sequence.
2. **P1 — state fidelity:** after stale-selection recovery, applying to Frame 13 initially changed the Frame 12 visual. Fixed the selected-frame styling contract and added a real applied state for Frame 13. Post-fix computed styles confirmed Frame 12 remained yellow while selected Frame 13 became blue.
3. **P2 — above-the-fold hierarchy:** the first implementation placed too little of the workspace in the 1000 px desktop viewport. Reduced hero type scale and vertical padding; the accepted entry capture now shows the layers, canvas, properties, and workflow controls immediately.
4. **P2 — premature actions:** Apply and Undo originally appeared actionable before prerequisites were met. They now expose native disabled states until Plan or Apply makes them valid.
5. **Final pass:** combined source/implementation review found no remaining P0, P1, or P2 issue across typography, layout, colors, assets, copy, interaction, accessibility, or responsiveness.

## Follow-up polish

- P3: a future launch video can reuse these exact interaction states, but it is not required for the product demo to work.
