# Nine Cafe & Eatery — Revision Notes

**Prepared:** 19 Oct 2026
**Artifact:** static single-page site in `C:\Users\ASUS\Documents\Default Project\Nine Caffe`
**Status:** design demonstration. Menu and logo are supplied; photos, live WhatsApp
number, and Instagram handle are still pending.

---

## 1. What this revision is

The old page was a generic card stack with a placeholder menu, low-contrast text,
and motion that hid content until JavaScript ran. The revision keeps the warm,
local, late-night positioning and rebuilds the surface around the provided menu
and circular “9 / NINE.” logo.

The design direction is **Dusk Coffee Ledger**: warm paper, deep espresso green,
burnt clay, and one butter-yellow signal. The page reads like a printed menu
ledger under a low lamp: oversized Fraunces type, ruled lines, numbered sections,
and mixed paper/forest surfaces instead of identical rounded cards.

---

## 2. Design system

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#F2EBDD` | Page canvas |
| Paper deep | `#E7DCC8` | Recessed panels |
| Paper light | `#FFFBF3` | Cards, logo disc |
| Ink | `#17211B` | Body text, logo |
| Forest | `#203026` | Bands, sheet, CTA |
| Sage | `#4B6352` | Secondary text |
| Clay | `#9C4A2E` | Numbers, italic accents |
| Butter | `#E4C36A` | Open signal, focus ring |
| Muted | `#5D665E` | Captions, notes |

Type: **Fraunces** 600/700 plus italic for display; **Inter** 400–700 for body.
Radii 4 / 12 / 22. Max content width 1240px.

---

## 3. Menu and logo update

- The supplied menu photos replaced the old 15-item placeholder menu.
- Five categories: Coffee Based, Milk Based, Refresher, Main Course, Snack Based.
- 25 items with the supplied prices, pinned by `tests/menu-data.test.js`.
- Only printed descriptions were added: Milky Berry (strawberry/blueberry) and
  Indomie (goreng/kuah/nyemek). Nothing else was invented.
- The printed spelling `Butterscooth Latte` is preserved. Tell the developer if the
  cafe wants `Butterscotch`.
- The circular “9 / NINE.” logo was redrawn as inline SVG and now appears in the
  header, footer, favicon, and social assets. It is faithful to the photo, but the
  original vector file is still the safer master.

---

## 4. Structure

1. **Header** — brand mark, brand lockup, section navigation, order CTA.
2. **Hero** — asymmetric 7/5 grid, live open/closed badge, editorial still-life SVG.
3. **Running ticker** — hours, location, service cues.
4. **Highlights bento** — five mixed-surface panels: atmosphere, menu, hours,
   facilities, ordering.
5. **Menu ledger** — category pills, search, two-column dotted-leader list,
   add-to-cart buttons, demo note.
6. **Gallery** — six numbered CSS illustrations; real-photo lightbox is ready but
   disabled while `CAFE.gallery` is empty.
7. **Hours and location** — weekly table, today marker, inline SVG map, address
   and directions button.
8. **Order band** — forest CTA into the menu or the sheet.
9. **Footer** — large logo, contact placeholders, demo disclosure.
10. **Cart bar + order sheet** — persistent cart, quantity controls, item notes,
    customer form, copy and WhatsApp fallback.

---

## 5. Motion

One easing family: `--ease-out`, `--ease-in-out`, `--ease-drawer`. Press 120ms,
hover 160ms, state 200ms, drawer 280ms, reveal 420ms. Only `transform` and
`opacity` animate. Hover transitions are gated behind
`@media (hover: hover) and (pointer: fine)`. `?motion=off` and
`prefers-reduced-motion` remove marquee, parallax, reveal movement, and drawer
slide without hiding content.

---

## 6. Accessibility

- Skip link, visible focus ring, semantic landmarks, labelled controls.
- Order sheet and lightbox are real dialogs with focus trap, Escape close, focus
  restoration, `inert` background, and scroll lock.
- Live regions announce cart changes, copy results, and empty states.
- Mobile inputs stay at 16px; touch targets are at least 44px.
- Axe: **0 violations** on mobile 390×844 and desktop 1440×1000. The single
  `color-contrast` incomplete group is caused by gradient backgrounds and was
  reviewed manually.

---

## 7. Ordering flow

Pilih menu → tambah ke keranjang → buka “Lihat pesanan” → atur jumlah dan
catatan → isi nama, jenis pesanan, nomor meja bila perlu → salin atau kirim.
Because the live WhatsApp number is not supplied, **Kirim via WhatsApp** copies
the exact order text and shows a toast; **Salin pesanan** does the same on demand.
The order text is built by `cafe-core.js`, so every path produces the same result.

---

## 8. Tests and QA

- `node --test` → **26/26 pass** (ordering, hours, formatting, cart repair,
  stale-cart migration, message building, menu data integrity).
- Browser QA: menu filter/search, URL state, add/update/remove/clear cart,
  reload persistence, sheet focus trap, Escape restoration, copy and send
  fallback, order-type table rules, scrollspy, `[hidden]` guard, maxlength,
  HTML-injection check, console and page errors.
- Vitals: FCP under 300ms, TTFB under 5ms, CLS 0.

Full detail and screenshots: `docs/qa-report.md`, `docs/qa/`.

---

## 9. Produced assets

| Asset | File |
| --- | --- |
| X post card, 1080×1080 | `assets/social/x-post-card.png` + `.html` |
| Xiaohongshu set, 4 × 1080×1440 | `assets/social/xiaohongshu-01..04.png` + `xiaohongshu-cards.html` |
| X/website banner, 1500×500 | `assets/banners/banner-1500x500.png` + `.html` |
| Square banner, 1080×1080 | `assets/banners/banner-1080x1080.png` + `.html` |
| Favicon | `assets/favicon.svg` |
| This report | `docs/revision-report.html` and `docs/revision-report.pdf` |

All assets use the same palette, type system, and “Contoh desain” marker. No
invented reviews, awards, engagement numbers, or stock photos.

---

## 10. How to preview

```powershell
cd "C:\Users\ASUS\Documents\Default Project\Nine Caffe"
npm run serve        # http://127.0.0.1:4173
npm test             # 26 tests
```

Demo parameters: `?jam=20:00`, `?hari=0..6`, `?motion=off`, `?kategori=Coffee%20Based`,
`?cari=latte`, `?demo=cart`, `?sheet=1`.

---

## 11. Before launch

1. Confirm the WhatsApp number and replace `CAFE.waNumber`.
2. Supply real photos; drop them into `CAFE.gallery` and allow the lightbox.
3. Confirm the Instagram handle.
4. Approve the SVG logo redraw or supply the original vector file.
5. Confirm the `Butterscooth Latte` spelling and final prices.
6. Replace or remove “Contoh desain” markers once the owner approves the site.

---

## 12. Design direction — Window Seat (2026-10-20)

The owner approved direction **B — Window Seat** from three homepage directions.
Implemented in `127dc8a`: dark cinematic hero, centered section heads, paper menu card
(two columns at >=1100px), gallery filmstrip, dark location card, oversized footer seal.
Typography, palette, copy, ordering flow and demo disclosures are unchanged.

Design audit: **B+ (3.60) -> A (3.95)**; AI slop **B+ (3.50) -> A- (3.70)**. Tests 26/26,
no overflow at 1440/390, print 9 pages (2-column menu, 3x2 gallery), benchmark budget A (6/6).

- Details: `docs/design-review.md`
- Full report: `C:\Users\ASUS\.gstack\projects\DefaultProject\designs\design-audit-20261020\design-audit-127.0.0.1.md`
- Board: `C:\Users\ASUS\.gstack\projects\DefaultProject\designs\homepage-directions-20261020\comparison.html`
