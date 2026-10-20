# Nine Cafe Revision — Task Ledger

Status: complete on 19 Oct 2026. Evidence lives in `docs/qa-report.md`,
`docs/revision-notes.md`, `docs/architecture-review.md`, and `docs/qa/`.

## Contract
- [x] Read existing HTML/CSS/JS/data
- [x] Baseline screenshot, axe audit, console check
- [x] Write `DESIGN.md`, `design-contract.md`, `implementation-handoff.md`

## Architecture + tests
- [x] Write failing tests for `cafe-core.js` (red)
- [x] Implement `cafe-core.js` deep module (green)
- [x] Wire `app.js` to the core, remove duplicated rules
- [x] Add npm scripts for test + local preview
- [x] Add `tests/menu-data.test.js` to pin the supplied menu (`node --test` → 26 pass)
- [x] Add `cartForMenu()` migration so old stored carts cannot order removed items

## Visual revision
- [x] Rewrite `index.html` structure (skip link, hero, bento, menu ledger, gallery, hours, CTA, drawer)
- [x] Rewrite `style.css` tokens, layout, components, responsive, reduced motion
- [x] Fix `[hidden]` overlay bug and progressive enhancement
- [x] Improve contrast and accessibility (labels, tab semantics, focus, dialog roles)
- [x] Update `app.js` rendering + interactions, URL state, focus management
- [x] Motion pass: tokens, reveal, drawer, cart feedback, hover gating
- [x] Replace the placeholder menu with the supplied 25-item menu and prices
- [x] Rebuild the brand mark from the supplied circular “9 / NINE.” logo and add favicon

## QA
- [x] Desktop + mobile screenshots (`docs/qa/screenshots/`)
- [x] Axe audit zero violations on mobile and desktop; one gradient `color-contrast` incomplete group reviewed manually
- [x] Keyboard and cart flow tests (filter, search, URL state, add/update/remove/clear, persistence, focus trap, Escape, copy/send fallback)
- [x] Injection, maxlength, `[hidden]`, scrollspy, console/error checks
- [x] `node --test` green (26/26)
- [x] Write `docs/qa-report.md`

## Deliverables
- [x] X post card (1080×1080) HTML + PNG — `assets/social/x-post-card.*`
- [x] Xiaohongshu 4-card set (1080×1440) HTML + PNGs — `assets/social/xiaohongshu-*`
- [x] Banner set (1500×500 + 1080×1080) HTML + PNGs — `assets/banners/*`
- [x] Revision notes markdown + print-ready HTML/PDF — `docs/revision-notes.md`, `docs/revision-report.html`, `docs/revision-report.pdf`
- [x] Architecture review note — `docs/architecture-review.md`

## Notes
- `gstack-make-pdf` binary is not built on this Windows host. The PDF was produced
  through agent-browser's `pdf` export from `docs/revision-report.html` (10 pages).
- The gstack bash preamble cannot run here; QA used agent-browser and Node tests.
- Demo placeholders remain: `CAFE.waNumber`, empty gallery, no live Instagram.
- The printed menu spelling `Butterscooth Latte` was preserved as supplied.
