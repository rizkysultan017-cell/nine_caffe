# Motion Review — Nine Cafe & Eatery

**Scope:** every animation and transition in `style.css` and `app.js`.
**Standard:** `review-animations` + `STANDARDS.md` (Emil Kowalski), with
`motion-lab` patterns used for the remedies.
**Baseline reviewed:** commit `8c0dc38`.
**Re-checked:** 20 Oct 2026 at `http://127.0.0.1:4173`.

Line references in **Before** point at the baseline commit; the working tree
contains the **After** state.

## Part 1 — Findings

| Before | After | Why |
| --- | --- | --- |
| `style.css:261` — nav underline animates `right: 100% → 0` over 200ms | `transform: scaleX(0 → 1)` on `::after`, `transform-origin: left center`, 180ms `--ease-out` | `right` triggers layout on every hover, focus, and scrollspy change. A transform stays on the compositor and keeps the same visual. |
| `style.css:1307` — gallery hover zoom runs 500ms | 240ms `--ease-out` | Hover feedback belongs in the 160–250ms band. At 500ms the frame feels laggy rather than responsive. |
| `style.css:1238` — `.menu-add:hover svg { transform: rotate(90deg) }` | rule removed | The icon is a symmetric plus. A 90° rotation maps onto itself, so the animation is invisible dead code. |
| `style.css:527–534` — hero entrance is 760ms with delays up to 380ms | 560ms with 40–230ms delays (40–50ms gaps) and a 14px rise | The last hero element landed at ~1.14s. The compressed run finishes at ~0.79s while keeping the 30–80ms stagger. One-shot marketing entrance justifies the >300ms budget. |
| `style.css:305, 872, 1310, 1728` — button arrows, bento arrow, gallery zoom, and icon shifts move on `:hover` outside any hover query | moved into `@media (hover: hover) and (pointer: fine)` | Touch devices fire false hovers and can leave a sticky zoom or shifted icon. Color-only hover states may stay ungated. |
| `app.js:699–706` — cart count bump toggles a class and reads `offsetWidth` to restart it | WAAPI `element.animate()` over 200ms, cancels the previous run, skipped when `motionOff` | Removes a synchronous layout read on every add-to-cart. The animation is compositor-driven and interruptible. |
| `style.css:2345` — lightbox appears with no transition | `@starting-style` opacity 0 → 1 over 180ms `--ease-out` | Occasional modal; appearing from nowhere is jarring. `@starting-style` gives it an entry without extra JS or state. |
| `style.css:1242` — add-button press scales to 0.94 | 0.96 | Press feedback budget is 0.95–0.98. 0.94 is slightly theatrical for a 44px control. |
| `style.css:2874–2911` and `2944–2995` — `?motion=off` still allowed bento lift, header slide, icon shifts, and gallery zoom | explicit still mode now disables those transforms and transitions; the active nav underline stays visible with a 0s transition | “Motion off” must be genuinely still. State indication (underline, color) remains, movement does not. |
| `style.css:3013` — print CSS hid `[data-enter]` hero content at `opacity: 0` | print forces `[data-enter] { opacity: 1; animation: none; transform: none; }` | Print/PDF must not depend on an entrance animation that never runs. |

## Part 2 — Verdict

### Feel-breaking regressions

None remain. The two >300ms animations are deliberate and scoped: the hero
entrance is a first-load marketing moment (560ms, 40–50ms stagger), and scroll
reveal is section-level decorative motion (420ms). Neither runs on a repeated
control, a keyboard shortcut, or a rapid state change.

### Missed simplifications

The dead plus-icon rotation was deleted rather than restyled. The count bump was
kept because it confirms an add that happens tens of times per session, but it is
now a short WAAPI pulse instead of a class toggle plus forced reflow.

### Performance

No layout or paint property is animated in the primary UI path. The nav
underline, drawer, cart bar, toast, sheet, and gallery zoom all use `transform`
and `opacity`. The bento card still transitions `box-shadow` alongside its 3px
lift; the painted area is small and hover-only, so it is retained intentionally.
The header shadow no longer transitions.

### Interruptibility & timing

Cart bar, toast, sheet, focus ring, and count feedback all use transitions or
WAAPI, so they retarget from the current state. The only keyframe animation is
the one-shot hero entrance, where restart behaviour is irrelevant. Enter/exit
timings are asymmetric where it matters: the sheet opens over 280ms, closes and
unmounts after 300ms; the cart bar appears over 260ms and leaves over 260ms with
a 280ms hide timer.

### Origin, physicality & cohesion

The lightbox is a viewport modal, so it fades in place rather than scaling from
a trigger. The sheet enters from the correct edge (bottom on mobile, right on
desktop) with the iOS-like `--ease-drawer` curve. Press feedback is 0.96–0.98,
never `scale(0)`. Hover lift is 1–3px, matching the warm, quiet personality
rather than a playful bounce.

### Accessibility

`prefers-reduced-motion` and `?motion=off` both remove loops, movement, and hover
transforms while keeping opacity, color, and the active nav underline. Hover
movement is gated behind `(hover: hover) and (pointer: fine)`. Keyboard focus
uses the untouched global `:focus-visible` ring and never animates.

**Decision: Approve.** All findings in the table are applied in the working tree.
Computed styles confirm transform/opacity-only motion, reduced motion and
`?motion=off` disable movement, and the site still passes 26/26 tests, 0 axe
violations on mobile and desktop, and a clean console.
