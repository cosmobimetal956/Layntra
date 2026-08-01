# Homepage interaction audit

## Audit scope

- Surface: public Layntra homepage.
- User goal: understand how Codex changes an editable Figma selection and whether the user remains in control.
- Accessibility target: a keyboard-operable, readable, responsive product demonstration with explicit state feedback.

## Flow

1. **Previous entry — weak interaction health**
   - Evidence: `artifacts/interaction-audit/01-current-home.png`.
   - Strength: the option 3 visual system was distinctive and the product promise was legible.
   - Risk: the hero was a static result image. It did not expose layers, selection, target, before/after values, or a user action, so the page behaved like a presentation.

2. **Inspect and plan — strong interaction health**
   - Evidence: `artifacts/interaction-audit/02-interactive-home.png` and `artifacts/interaction-audit/06-mobile-plan.png`.
   - The visitor sees a Figma-like layers/canvas/properties workspace and a separate Codex command surface. Planning marks the actual editable elements without changing them.

3. **Stale selection — strong safety feedback**
   - Evidence: `artifacts/interaction-audit/03-stale-selection-blocked.png`.
   - Changing the selection after planning creates a visible target mismatch. Apply is blocked, the status explains why, and the next action is re-inspection.

4. **Apply and undo — strong completion health**
   - Evidence: `artifacts/interaction-audit/04-applied.png`.
   - The selected frame visibly changes, the command reports read-back verification, and Undo restores the original design.

5. **Installation — strong handoff health**
   - Evidence: `artifacts/interaction-audit/08-install.png`.
   - The page moves from the product experience to three concrete setup steps without re-explaining the entire marketing story.

## Highest-impact design decisions

- Replaced the static hero asset with a working product simulation.
- Made the Figma selection and planned target separate visible objects.
- Turned stale-selection protection into something a visitor can deliberately test.
- Kept the option 3 editorial language as the frame around the product, not the product itself.
- Reduced the homepage from multiple large explanatory chapters to demo → boundaries → install → start.

## Accessibility evidence and limits

- Confirmed native controls, pressed/disabled states, visible focus, polite live status, blocking alert, reduced motion, and 390 px reflow without page overflow.
- Browser screenshots cannot prove every screen-reader announcement. The DOM and automated contract checks cover the required live-region and semantic-control markup; assistive-technology testing remains a future P3 refinement.
