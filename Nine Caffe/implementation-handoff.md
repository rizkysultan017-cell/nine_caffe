# Implementation Handoff — Nine Cafe Revision

## Read first

- `DESIGN.md` — binding visual direction
- `design-contract.md` — evidence, keep/change boundaries, quality gate
- `data.js` — only source of cafe facts
- `tests/` — regression tests for the ordering/hour logic

## Binding tokens

```
paper       #F2EBDD
paper-deep  #E7DCC8
paper-light #FFFBF3
ink         #17211B
forest      #203026
sage        #4B6352
clay        #9C4A2E
butter      #E4C36A
muted       #5D665E
line        rgba(23,33,27,.14)
```

Display: Fraunces 600/700 + italic. Body: Inter 400/500/600. Max 2 families.
Radii: 4 / 12 / 22. Max content width 1240px. Section padding
`clamp(72px, 10vw, 144px)`.

## Layout constraints

- Header 64px, translucent paper, thin rule, hides on scroll down.
- Hero: 7/5 asymmetric grid; oversized wordmark; visual frame on the right.
- Highlights: 5-panel bento with mixed paper/forest/clay surfaces.
- Menu: two-column printed ledger with dotted leaders and circular add buttons.
- Gallery: numbered contact sheet; placeholders must look art-directed.
- Hours/location: ticket card + inline SVG map.
- CTA: full-bleed forest band.
- Footer: compact, large wordmark, demo disclosure visible.

## Motion constraints

Use one easing family:
- `--ease-out: cubic-bezier(.23,1,.32,1)`
- `--ease-in-out: cubic-bezier(.77,0,.175,1)`
- `--ease-drawer: cubic-bezier(.32,.72,0,1)`

Press 120–160ms, hover 160–240ms, state 200ms, drawer 280ms, hero 560ms,
reveal 420ms. Animate only `transform` and `opacity`. Gate hover transitions and
hover movement with `@media (hover: hover) and (pointer: fine)`. Honor reduced
motion and make `?motion=off` fully still: no header slide, bento lift, gallery
zoom, or icon shift. Keep the active nav underline visible with a 0s transition.

- Nav underline: `scaleX(0 → 1)`, never animate `right`.
- Menu add: press 0.96; do not rotate the symmetric plus.
- Cart count: WAAPI pulse, no `offsetWidth` reflow.
- Lightbox: `@starting-style` fade; print must force `[data-enter]` visible.
- No `transition: all`. Audit: `docs/motion-review.md`.

## Asset rules

- Do not fetch external images.
- Use inline SVG or CSS art for the hero still life, map, logo, and gallery
  placeholders.
- The supplied circular “9 / NINE.” logo is reproduced as an inline SVG in the
  header, footer, favicon, and social assets. Do not replace it with a generic
  monogram.
- Keep all demo markers: “Contoh”, “Contoh desain”, placeholder phone.
- Social assets reuse the same tokens; no invented reviews, awards, or engagement
  numbers.

## Architecture constraints

- `cafe-core.js` is a deep, UMD-style module for pure ordering/hour/message logic.
- `app.js` owns DOM wiring only; it must not duplicate core rules.
- `node --test` must pass without a bundler or browser.
- Do not introduce a framework or runtime dependency for the static site.

## First artifact should prove

1. The page renders correctly with JavaScript disabled (except interactive cart).
2. The empty order sheet is not visible on load.
3. Menu rows and bento panels are visible on first paint and reveal only as an
   enhancement.
4. Axe returns zero serious/critical violations.
5. Cart and WhatsApp message still work after the refactor.
