# QA Report — Nine Cafe & Eatery revision

**Date:** 19 Oct 2026
**Target:** `http://127.0.0.1:4173` (static site, local `server.mjs`)
**Scope:** revised single-page site, menu/logo content update, cart and WhatsApp fallback, accessibility, responsive layout, social/print exports
**Final status:** DONE — 0 axe violations, 26/26 tests, no console errors

---

## 1. Environment

| Item | Value |
| --- | --- |
| OS | Windows (win32) |
| Node | v24.21.0 |
| npm | 11.19.0 |
| Browser CLI | agent-browser 0.39.1 (Chrome) |
| Test runner | `node --test` (no dependencies) |
| Server | `server.mjs`, port 4173, `Cache-Control: no-store` |
| Demo URL params | `?jam=20:00`, `?hari=0..6`, `?motion=off`, `?kategori=…`, `?cari=…`, `?demo=cart`, `?sheet=1` |

`gstack` bash preamble cannot run on this Windows host. QA ran through the
installed agent-browser CLI and Node's test runner. The gstack `make-pdf` binary
is not built; the PDF fallback uses agent-browser's `pdf` command on a
print-ready HTML report.

---

## 2. Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Syntax | `node --check app.js`, `cafe-core.js`, `data.js`, `server.mjs` | pass |
| Unit tests | `node --test` | 26/26 pass |
| Mobile axe | agent-browser `a11y --json` at 390×844 | 0 violations, 47 passes, 1 incomplete (152 nodes) |
| Desktop axe | agent-browser `a11y --json` at 1440×1000 | 0 violations, 46 passes, 1 incomplete (153 nodes) |
| Console | agent-browser `console` after reload | clean |
| Page errors | agent-browser `errors` after reload | clean |
| Web vitals | agent-browser `vitals --json` | FCP under 300 ms, TTFB under 5 ms, CLS 0 |

Axe JSON: `docs/qa/a11y-mobile-final.json`, `docs/qa/a11y-desktop-final.json`.
Vitals JSON: `docs/qa/vitals-desktop.json`.

The single incomplete axe group is `color-contrast` on elements that sit over
CSS gradients. Axe cannot compute the background, so it defers. Manual review:
ink `#17211B` on paper `#F2EBDD` / `#FFFBF3`, paper-light on forest `#203026`,
and butter `#E4C36A` on forest all clear WCAG AA at their used sizes. No text
uses the clay/sage family as a small body color over a gradient.

---

## 3. Functional test matrix

| Flow | Steps | Result | Evidence |
| --- | --- | --- | --- |
| Menu render | Load with no params | 25 items, 5 categories, `25 menu · semua kategori` | `desktop-menu-real.png` |
| Category filter | Click `Coffee Based` | Only Coffee Based items, pill `aria-pressed` correct | browser eval |
| Search | Type `latte`, `roti` | `latte` → matching items; `roti` → empty state, no crash | `mobile-menu-empty.png` |
| URL state | `?kategori=Milk Based&cari=latte` | Input, pill, count, and 2-item result restored | browser eval |
| Add to cart | Click `+` on a menu row | Cart count 1, total `Rp 18.000`, bar visible and centered | `desktop-menu-real.png` |
| Persistence | Reload after add | Cart count and total restored from `localStorage` | browser eval |
| Stale-cart migration | Seed old cart with `Kopi Susu Senja` and a wrong-priced `Aren Latte`, reload | Obsolete item dropped; Aren Latte repriced to Rp 18.000; qty 500 clamped to 99 | browser eval |
| Sheet open | Click `Lihat pesanan` | Sheet opens, focus on close, background inert, scroll locked | `mobile-sheet-final.png` |
| Quantity +/− | Increment then decrement | `Aren Latte sekarang 2` announcer, total updates | browser eval |
| Remove | Decrement at qty 1 | Item removed, empty state, buttons disabled, focus to close | browser eval |
| Clear | `Bersihkan` → dismiss and accept | Dismiss keeps cart; accept empties cart and storage | browser eval |
| Copy order | `Salin pesanan` | Exact message copied, toast + live-region text | browser eval (clipboard hook) |
| Send fallback | `Kirim via WhatsApp` with placeholder number | Toast explains demo, copies message instead | browser eval |
| Order type | Switch `Makan di tempat` → `Ambil` | Table field hides; message drops table/uses `Jenis: Ambil` | browser eval |
| Escape | Press Escape in sheet | Closes, focus returns to `Lihat pesanan`, `aria-expanded=false` | browser eval |
| Focus trap | Tab from last control, Shift+Tab from first | Wraps between `copyOrderBtn` and `sheetClose` | browser eval |
| Demo params | `?demo=cart&sheet=1`, `?sheet=1` | Demo cart and open-sheet state work | browser eval |
| Scrollspy | Scroll to `#kunjungan` | `Jam & Lokasi` gets `aria-current="true"` | browser eval |
| `[hidden]` fix | Inspect toast/backdrop/sheet/lightbox while hidden | All compute `display: none` | browser eval |
| Maxlength | Type 70 chars into name | Value stops at 60 | browser eval |
| Injection | Type `<img src=x onerror=…>` into name/note | No DOM injection, no `window.__xss`, copied order keeps raw text | browser eval |
| Console/errors | Reload and read logs | No console output, no page errors | agent-browser |

---

## 4. Visual review

Captured at mobile 390×844 and desktop 1440×1000:

| Screen | File | Notes |
| --- | --- | --- |
| Mobile hero | `screenshots/mobile-hero-real.png` | 38px logo mark, brand text, hero, ticker |
| Mobile gallery | `screenshots/mobile-gallery-real.png` | 2-column contact sheet, numbered captions |
| Mobile hours/location | `screenshots/mobile-visit-real.png` | Ticket card, `Hari ini` marker, map/address |
| Mobile order band | `screenshots/mobile-order-real.png` | Forest CTA, footer logo, cart bar |
| Mobile sheet | `screenshots/mobile-sheet-final.png` | Bottom sheet, quantity controls, form, both actions |
| Desktop hero/logo | `screenshots/desktop-menu-logo.png` | Header brand mark and first viewport |
| Desktop menu | `screenshots/desktop-menu-real.png` | Ledger grid, categories, prices |
| Desktop sheet | `screenshots/desktop-sheet-real.png` | Side sheet with order summary |
| Desktop highlights | `screenshots/desktop-highlight-real.png` | Bento mix, menu panel |

No horizontal scroll at 390px. Fixed cart bar clears the footer at the
document bottom (`footerBottom.bottom=724`, `cartBar.top=766` at 390×844).

---

## 5. Bugs found and fixed during this pass

| # | Severity | Finding | Fix | Status |
| --- | --- | --- | --- | --- |
| 1 | High | Cart did not survive reload: `saveCart()` wrote `{cart, meta}`, normalizer expected `{items, meta}` | Normalizer accepts both shapes; writer uses canonical `{items, meta}`; regression test added | verified |
| 2 | High | Axe reported 6 mobile contrast failures plus 1 ARIA issue | Reworked `.signature-note`, bento indices, hours/order labels, footer note; removed invalid `aria-label` from footer wordmark | verified |
| 3 | High | With `motion=off`, the cart bar was half offscreen (`x=195`, width 358) | `html.motion-off` keeps `translateX(-50%)`; bar now centered at `x=16` | verified |
| 4 | Medium | `[hidden]` overlays could be overridden by component `display` rules | Global `[hidden]{display:none!important}` guard | verified |
| 5 | Medium | Old placeholder menu had invented descriptions and 15 fake rows | Replaced with the supplied 25-item menu and prices; no invented descriptions | verified |
| 6 | Medium | Header/footer used a generic `9` monogram | Replaced with the supplied circular “9 / NINE.” logo as inline SVG, favicon, and social asset | verified |
| 7 | Low | Search placeholder still suggested `roti`, which is not on the menu | Placeholder now `Cari latte, teh, camilan…` | verified |
| 8 | High | After the menu replacement, a stored cart could keep obsolete items and outdated prices | Added `cartForMenu()` to the core: drop unknown items, reprice from the current menu, clamp quantity; wired into `loadCart()` with a browser migration check | verified |

---

## 6. Content fidelity

- Menu source: supplied menu photos (Coffee Based, Milk Based, Refresher,
  Main Course, Snack Based).
- 25 items, prices 10.000–20.000, pinned by `tests/menu-data.test.js`.
- Only printed descriptions were added: `Milky Berry` (strawberry/blueberry)
  and `Indomie` (goreng/kuah/nyemek).
- Printed spelling `Butterscooth Latte` is preserved as supplied. Flag it if the
  cafe wants `Butterscotch`.
- Logo source: supplied circular sticker photo; reproduced as SVG. It is a
  faithful redraw, not the original vector file.
- Still no real photos, live WhatsApp number, or Instagram handle. Demo labels
  and `628XXXXXXXXXX` remain.

---

## 7. Deferred / known limitations

1. **Live WhatsApp number.** Order actions copy the order and show a toast; they
   do not open a chat. Replace `CAFE.waNumber` when the cafe confirms a number.
2. **Photos.** `CAFE.gallery` is empty; gallery shows six labeled CSS
   illustrations and the lightbox stays disabled.
3. **Fonts.** Google Fonts is the only external request. The site falls back to
   Georgia/system sans if it is blocked.
4. **Logo vector.** Confirm the SVG redraw before print or signage.
5. **PDF tooling.** gstack `make-pdf` is not built on this host. `docs/revision-report.pdf`
   is produced through agent-browser's PDF export.
6. **Axe incomplete group.** Gradient backgrounds prevent automated contrast
   verification on 152–153 nodes; manual review found no failures.

---

## 8. Health score

**96 / 100** — no blocking or high-severity findings remain. The four points
held back are the axe incomplete group (gradients), the unverified logo vector,
the remaining demo contact/photo state, and the fallback PDF path.

---

## 9. Motion polish pass (20 Oct 2026)

Baseline commit `8c0dc38`, after the `review-animations`, `motion-lab`,
`web-design-guidelines`, and `reference-design-contract` pass.

| Check | Result |
| --- | --- |
| `node --test` | 26/26 pass |
| Mobile axe 390×844 | 0 violations, 46 passes, 1 incomplete (gradients, 136 nodes) |
| Desktop axe 1440×1000 | 0 violations, 45 passes, 1 incomplete (gradients) |
| Console / page errors | clean |
| Vitals | FCP 216 ms, TTFB 2.2 ms, CLS 0 |
| Reduced motion | `[data-enter]` opacity 1 with no animation; ticker off; hover transitions off; reveals visible |
| `?motion=off` | header, bento, gallery, and icon transitions compute to 0s; active nav underline stays visible without a transition |
| Cart count | exactly one WAAPI animation during add; no `.is-bumped` class, no forced reflow |
| Sheet | open/close, focus, `aria-expanded`, and 44px close target verified |
| Header | hides on scroll down, returns on scroll up; scrollspy sets `aria-current` |

Findings and the approval verdict: `docs/motion-review.md`. Computed-style
evidence: `.site-nav a::after` transitions `transform` over 180ms starting from
`matrix(0, …)`; `.gallery-art` hover is 240ms; `.lightbox` transitions `opacity`
over 180ms with `@starting-style`.

Health score is unchanged: motion polish removed the flagged issues without
affecting the axe result.
