# Nine Cafe — Reference Design Contract

## Goal and target artifact

Revise the existing single-page Nine Cafe & Eatery site into a production-quality
static site with a coherent “Dusk Coffee Ledger” visual direction, accessible
ordering flow, motion system, regression tests for ordering logic, and matching
social/print assets.

**Audience:** people in Dau and greater Malang looking for coffee, warm food, and
a late-night place to sit. Secondary audience: the cafe owner reviewing a design
demo before supplying real photos and contact data.

**Target artifact:** `index.html` + `style.css` + `app.js` + supporting modules,
served locally. No framework, no build step required.

## Evidence

| Evidence | Source | Confidence |
| --- | --- | --- |
| Warm sand/forest/clay palette | `data.js` `theme`, `style.css` variables | observed |
| Fraunces + Inter pairing | `index.html` font link, `style.css` | observed |
| WhatsApp ordering, cart, order sheet | `index.html`, `app.js` | observed |
| Menu categories, 25 items, and prices | `data.js`, supplied cafe menu photos | provided |
| Circular “9 / NINE.” logo | supplied logo photo, reproduced as inline SVG | provided |
| Hours 13.00–00.00, all week | `data.js` `hours` | provided (demo, awaiting confirmation) |
| Missing photos, live phone, Instagram | `data.js` placeholders, `assets/` photos empty | observed |
| Existing order panel visible on load | baseline browser screenshot | observed |
| Contrast failures in labels/footer | axe audit on baseline | observed |
| Motion craft gaps (layout animation, 500ms hover, dead icon rotation, ungated hover) | `review-animations` audit, `docs/motion-review.md` | verified |
| Ordering, hours, and cart regressions | `node --test` (26 tests) | verified |
| Audience and “warm local late-night” positioning | site copy + location | inferred |
| Brand history, interior photography, confirmed phone | none supplied | unknown |

## Keep / Change / Do not copy

| Reference quality | Decision |
| --- | --- |
| Warm earthy palette | **Keep** — deepen it, remove washed-out low-contrast variants |
| Fraunces display + Inter body | **Keep** — use scale and rhythm more deliberately |
| Indonesian voice, local specificity | **Keep** — sharpen copy, no invented claims |
| WhatsApp-first ordering | **Keep** — simplify the flow and preserve cart details |
| Late-night hours | **Keep** — make it a defining visual idea |
| Centered blob hero with empty placeholder | **Change** — replace with asymmetric editorial hero + intentional still-life frame |
| Equal rounded cards for every section | **Change** — bento with mixed surfaces; menu becomes a ledger |
| Scroll reveal hiding content until JS | **Change** — progressive enhancement, visible by default |
| `transition: all`, 350–500ms generic easing, bounce on count | **Change** — named properties, custom curves, 120–280ms UI timings |
| Placeholder gallery as six gradient boxes | **Change** — numbered contact sheet with art-directed warm-light frames |
| Real photos, live phone, Instagram, reviews | **Do not copy or invent** — keep demo labels and `628XXXXXXXXXX` until supplied |
| Competitor layouts, copy, pricing, or claims | **Do not copy** |
| “Best cafe in Malang”, awards, star ratings | **Do not invent** |
| External stock photos | **Do not use** — offline-safe CSS/SVG placeholders only |

## Final design stance

Nine Cafe is a warm paper menu under a low lamp: oversized serif type, ruled
lines, deep forest bands, burnt clay labels, and a butter-yellow open signal. The
page is composed like an editorial spread with a sharp 12-column grid, not a
stack of SaaS cards. Motion is quick and physical, and every state is legible
without animation. The demo disclosure stays visible because the real brand
assets and contact details are not yet available.

## Risks and unknowns

- **No real photos.** The visual system must work with intentional placeholders;
  replacing them later must not require a layout rewrite.
- **No live phone number.** WhatsApp links are demo-only and must not be presented
  as a working order line.
- **Logo supplied as a photo.** The circular “9 / NINE.” mark is reproduced as an
  inline SVG from the supplied sticker photo, not from the original vector file.
  Confirm the mark before print or signage use.
- **Menu supplied via photos.** Names and prices follow the printed list. No extra
  descriptions are invented. The printed spelling “Butterscooth Latte” is preserved.
- **Single-file static architecture.** Shared logic must remain testable without a
  bundler; use a UMD-style core module and Node's built-in test runner.
- **No analytics or booking backend.** Do not imply reservations are confirmed by
  the site itself.

## Quality gate

- [x] No content depends on JavaScript to become visible.
- [x] No `[hidden]` element can be overridden by a component `display` rule.
- [x] All text meets WCAG AA contrast; axe reports zero serious violations on mobile and desktop. One `color-contrast` incomplete group remains because the hero uses gradients; reviewed manually.
- [x] Keyboard: skip link, visible focus, focus-trapped sheet/lightbox, Escape closes.
- [x] Mobile 390×844: no horizontal scroll, 44px touch targets, drawer usable.
- [x] Desktop 1440×1000: hero composition balanced, menu ledger readable.
- [x] Reduced motion: no marquee, parallax, reveal movement, or drawer slide.
- [x] Motion audit applied: no layout-property animation, hover movement gated, lightbox entry via `@starting-style`, cart count via WAAPI.
- [x] `?motion=off` is fully still — header, bento, gallery, and icon transforms disabled; state colors remain.
- [x] Print CSS shows `[data-enter]` hero content without waiting for the entrance animation.
- [x] Cart: add, increment, decrement, remove, persist, build WhatsApp message, copy.
- [x] Hours: open, closed, and past-midnight cases pass unit tests.
- [x] Demo disclosure remains visible.
- [x] Social/print assets use the same palette and type system.
