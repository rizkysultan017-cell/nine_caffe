# Design Review — Nine Caffe & Eatery

**Target:** `http://127.0.0.1:4173/?jam=20:00`
**Date:** 20 Oct 2026
**Scope:** homepage at 1440x1000, 768x1024, 390x844, plus print
**Baseline:** `9d3d68c` (after the motion pass, before design fixes)
**Approved direction:** Window Seat (B), implemented in `127dc8a`
**Status:** ready for owner review; demo markers stay until real data arrives

Full report: `C:\Users\ASUS\.gstack\projects\DefaultProject\designs\design-audit-20261020\design-audit-127.0.0.1.md`
Baseline JSON: `...\design-audit-20261020\design-baseline.json`
Direction board: `...\homepage-directions-20261020\comparison.html`
Benchmark: `.gstack/benchmark-reports/20261020-benchmark.md`

## Scores

| Score | Baseline | Final |
| --- | --- | --- |
| Design | B+ (3.60) | **A (3.95)** |
| AI slop | B+ (3.50) | **A- (3.70)** |

Category grades after the pass:

| Category | Weight | Baseline | Final |
| --- | --- | --- | --- |
| Visual hierarchy | 15% | A- | A |
| Typography | 15% | B+ | A |
| Spacing & layout | 15% | A- | A- |
| Color & contrast | 10% | B+ | A |
| Interaction states | 10% | B+ | A |
| Responsive | 10% | A | A |
| Content quality | 10% | A | A |
| AI slop | 5% | B+ (3.5) | A- (3.7) |
| Motion | 5% | A- | A |
| Performance feel | 5% | A- | A |

Spacing stays at A- because the full-bleed bands keep intentionally tight edge padding
(`DESIGN.md`) and the mobile filter row scrolls horizontally. Both are accepted, not bugs.

## Findings fixed

| ID | Finding | Impact | Commit | Status |
| --- | --- | --- | --- | --- |
| FINDING-001 | Functional labels below the 11px floor | high | `6583ebf`, repaired in `551cfec` | verified: 0 functional labels <11px; 4 decorative SVG labels remain |
| FINDING-002 | Secondary text failed 4.5:1 on paper | high | `4210f6f` | verified: muted token `#5D665E`; audit residual all false positives |
| FINDING-003 | Scrolling ticker duplicated announcements | medium | `437634a` | verified: static fact strip; marquee hit removed |
| FINDING-004 | Touch targets under 44x44 | medium | `551cfec` | verified for primary controls; inline exceptions accepted |
| FINDING-005 | Native `confirm()` when clearing the cart | medium | `a22283a` | verified: 7s undo toast, undo restores cart |
| FINDING-006 | Gallery placeholders were visually identical | medium | `69baab8`, `bf1304d` | verified: two art-directed variants + warm halo variants, all inline SVG/CSS |
| FINDING-007 | Print output was ink-heavy and badly paginated | medium | `92d9635`, extended in `127dc8a` | best-effort: print-media preview verified; 9-page PDF generated, page images not reviewed |

## Verification

- **Tests:** 26/26 (`node --test`).
- **1440 / 390:** console clean, no horizontal page overflow.
- **Tiny text:** 0 functional labels below 11px; only four 10px decorative SVG map labels.
- **Contrast:** 4 residual audit rows, all false positives -- two footer SVG fills (audit
  reads CSS `color`, not `fill`) and two gallery captions over a dark gradient overlay.
- **Touch targets:** qty/remove render 32x32 with a `::after` hit area inset -6px, so the
  effective target is 44x44; sheet close is 44x44; send/copy are 354x48. Inline footer
  links (35x36 / 81x36), the nav Menu tab (37x44), the mobile header CTA (85x40), and the
  brand link (150x38) are accepted text targets.
- **Detector:** 73 -> 18 -> 16 (engine 0.1.3, DOM mode). The remaining 16 are accepted
  flags: cramped padding 7, low contrast 3 (static artifacts/overlay), overused font 2,
  flat type 1, shape-assembled illustration 1, radial halo 1, buried raster 1.
- **Benchmark:** no regressions; budget A (6/6). LCP 128 -> 120ms, transfer +3.0%,
  JS +1.6%, CSS +4.6%.
- **Print:** white hero/menu/order, ink text, 2-column menu, 3x2 gallery, 9 pages A4.
- **Direction:** Window Seat re-verified at 1440/768/390 and print; no new findings.

## Accepted flags

Full-bleed edge padding, Fraunces + Inter pairing, the inline-SVG room illustration,
3.5% paper grain, warm radial halos, gallery caption overlays, footer logo SVG fills,
decorative 10px map labels, and inline text targets. Each was checked against `DESIGN.md`
or confirmed as an audit false positive; no unexplained detector hit remains.

## Window Seat direction (approved)

The owner chose **B — Window Seat** from three homepage directions. The production layer
(`127dc8a`) adds:

- dark cinematic hero with cream frame and terracotta `&`
- centered section heads
- paper menu card, two columns at >=1100px
- gallery filmstrip (340px desktop / 260px tablet / 74vw mobile)
- dark location card beside the dark hours card
- oversized footer seal

The layout changed; the type system, palette, copy, ordering flow and demo disclosures did
not. Re-audit: no overflow, console clean, 0 functional labels <11px, 4 contrast false
positives, tests 26/26. CSS grew 6.9KB to 66.6KB, still under the 100KB budget. Print was
extended for the dark hero and menu band.

## Owner handoff

Before launch (also in `docs/revision-notes.md` section 11):

1. Confirm the WhatsApp number and replace `CAFE.waNumber`.
2. Supply real photos; drop them into `CAFE.gallery` and allow the lightbox.
3. Confirm the Instagram handle.
4. Approve the SVG logo redraw or supply the original vector.
5. Confirm `Butterscooth Latte` spelling and final prices.
6. Remove the "Contoh desain" markers and `@contoh_desain` once approved.

## Limits

Local static server, so timings are relative. Headless Chromium reports a fine pointer, so
coarse-pointer media queries are not exercised in screenshots; qty/remove hit area was
verified from CSS and runtime rects. The PDF was generated but its page images could not be
read in this session; print was verified with a print-media preview and computed styles.
Real photos, WhatsApp number, Instagram handle and final spelling/prices remain owner inputs.
