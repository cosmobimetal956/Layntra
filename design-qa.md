# Design QA — Option 3 editorial graphic system

Final result: **passed**

## Comparison setup

- Visual truth: `dist/design-references/selected-option-3.png` (748 × 2103 px).
- Desktop implementation: `artifacts/implementation-1440.png` (1440 × 5204 px), captured at a 1440 × 1000 CSS-pixel viewport, DPR 1.
- Focused final CTA: `artifacts/implementation-final-cta-1440.png` (1440 × 1000 px), captured at the same viewport and state.
- Mobile implementation: `artifacts/implementation-mobile-390.png` (390 × 844 px), captured at a 390 × 844 CSS-pixel viewport, DPR 1.
- Combined full-view comparison: `artifacts/design-qa-full.png`.
- Combined focused comparisons: `artifacts/design-qa-focused.png` and `artifacts/design-qa-final.png`.
- State: anonymous public homepage, self-hosted fonts loaded, both workflow images complete, no overlays or dialogs.
- Density normalization: the source concept and implementation were scaled to a common comparison height for the full pass and a common column width for focused passes.

## Comparison result

- Fonts and typography: Barlow Condensed supplies the tall editorial display voice; Inter keeps product copy readable. The hierarchy, hard line breaks, dense uppercase labels, and large numbered steps preserve the selected direction.
- Spacing and layout: the desktop hero, four-step path, split editorial sections, install grid, blue final CTA, rules, and footer follow the source system. The implementation uses slightly more vertical space to keep real copy legible rather than compressing it to concept-art density.
- Colors and surfaces: warm white, black, ultramarine (`#1646e8`), and signal yellow (`#ffd51e`) map directly to the reference. Surfaces stay flat and ruled; no generic card radii, gradients, or decorative shadows were introduced.
- Image quality: the workflow artwork is a purpose-built raster asset at 1586 × 992 px, rendered without stretching and with the correct blue/black/yellow pixel language. It is reused decoratively in the final CTA with an empty alt attribute.
- Responsiveness: the 390 px mobile capture has no horizontal overflow (`clientWidth = scrollWidth = 390`). Navigation, headline, CTA buttons, workflow art, and section grids stack without clipping or collision.
- Content and behavior: the release download, Codex installation, illustrated beginner guide, Docs, GitHub, FAQ, architecture comparison, and legal links remain present. The Docs navigation was exercised in-browser and reached the expected page.
- Accessibility: the page has one H1, labelled regions, meaningful hero alt text, a skip link, visible 3 px keyboard focus, reduced-motion handling, readable contrast, and full-width mobile tap targets.
- Icons: the design does not require an icon set. Arrow glyphs were removed from the implementation to avoid symbol-based fake iconography.

## Browser verification

- Desktop homepage rendered at 1440 × 1000.
- Mobile homepage rendered at 390 × 844 with no horizontal overflow.
- Docs navigation opened `how-it-works.html` and exposed the expected single page heading.
- First keyboard Tab reached the skip link and displayed the orange 3 px focus treatment against its yellow surface.
- External download and installation destinations were verified from the rendered DOM and automated contract tests.
- Console warnings/errors: none.
- The in-app browser's stitched full-page capture repeated the hero at the very bottom. DOM inspection confirmed a single header, hero, and final CTA; the focused final-CTA capture verifies the actual rendered ending.

## Fix history

1. **P1 — layout:** `100svh` expanded the hero excessively in the long-page capture. Replaced it with a bounded 720 px desktop hero minimum while preserving the intended above-the-fold composition.
2. **P2 — behavior/layout:** the sticky navigation was duplicated by long-page screenshot stitching. Changed it to a static header, which also makes the page feel closer to the print/editorial source.
3. **P2 — accessibility:** added an explicit automated contract for a single H1, skip-link target, focus-visible treatment, and reduced-motion behavior.

No P0, P1, or P2 findings remain.
