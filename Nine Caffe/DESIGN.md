# Nine Cafe & Eatery — Design Direction

**Working name:** Dusk Coffee Ledger
**Surface:** Single-page cafe site (static HTML/CSS/JS)
**Status:** Revision direction. The circular “9 / NINE.” logo and the 25-item menu
were supplied by the cafe owner on 19 Oct 2026 and are reproduced faithfully;
photography and live contact details are still pending.

---

## 1. Visual Theme & Atmosphere

A quiet, late-night coffee room rendered like a printed menu ledger. Warm paper,
deep espresso-green ink, burnt clay accents, and one butter-yellow signal color.
The page should feel hand-kept and local: generous type, ruled lines, numbered
sections, and small studio details rather than glossy startup cards.

The atmosphere is **dusk, not nightclub**. Warm lamps, wood tables, a cup left on
a saucer, handwriting in a notebook. Nothing neon, nothing glassy, nothing that
looks like a generic SaaS landing page.

**Design stance:** editorial warmth with a sharp grid. Every section should read
as a composed spread, not a stack of rounded rectangles.

---

## 2. Color

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | `#F2EBDD` | Page canvas, warm cream |
| `--paper-deep` | `#E7DCC8` | Recessed panels, photo mats |
| `--paper-light` | `#FFFBF3` | Cards, inputs, raised surfaces |
| `--ink` | `#17211B` | Primary text, near-black green |
| `--forest` | `#203026` | Dark bands, primary buttons |
| `--sage` | `#4B6352` | Secondary labels, quiet accents |
| `--clay` | `#9C4A2E` | Section labels, signature accents |
| `--butter` | `#E4C36A` | Open-state signal, small highlights |
| `--line` | `rgba(23, 33, 27, 0.14)` | Ruled lines and borders |
| `--muted` | `#5D665E` | Supporting copy |

Rules:
- Body text is always `--ink` or `--muted`; never low-contrast gray on gradient.
- `--clay` is for labels and marks, not long body copy.
- `--butter` is a signal color only: open status, one emphasis per section.
- No purple, no blue glow, no teal-to-pink gradients.
- Gradients may only simulate warm light, paper tone, or coffee depth.

All text pairs must meet WCAG AA: 4.5:1 for normal text, 3:1 for large display.

---

## 3. Typography

**Display:** Fraunces, variable optical size. Weight 600–700, tight tracking,
italic only for the ampersand and short emphasis.
**Body:** Inter, 400–600. UI labels use uppercase Inter with wide tracking.
**Numerals:** Inter with `font-variant-numeric: tabular-nums` for prices and hours.

Type scale:
- Hero display: `clamp(3.6rem, 9vw, 8.5rem)`, line-height `0.86`
- Section display: `clamp(2.2rem, 4.6vw, 4.25rem)`, line-height `0.98`
- Card title: `1.25rem–1.6rem`
- Body: `1rem–1.125rem`, line-height `1.65`
- Label: `0.6875rem–0.75rem`, uppercase, tracking `0.16em–0.2em`

Rules:
- No more than one display family and one body family.
- Use `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Avoid all-caps body copy. Labels only.
- Use real ellipses (…) and Indonesian punctuation.

---

## 4. Spacing & Grid

- Content max width: `1240px`
- Page gutter: `clamp(20px, 5vw, 64px)`
- 12-column desktop grid, 24px gap
- Section padding: `clamp(72px, 10vw, 144px)`
- Component spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96`
- Radii: `4px` for small marks, `12px` for controls, `22px` for large panels.
  Do not round every surface to the same value.
- Borders are 1px and usually warm-dark; shadows are low and warm, never blue.

Layout rhythm: alternate full-width editorial sections with contained spreads.
Never place more than two card-like surfaces side by side without a visual break.

---

## 5. Layout & Composition

**Header:** 64px, paper with blur, thin bottom rule. Left: monogram + wordmark.
Right: section links and a compact “Pesan” button. Hides on scroll down.

**Hero:** asymmetric 7/5 split. Left: status, oversized wordmark, one sentence,
two actions. Right: a tall “coffee still life” frame built from CSS/SVG, with
caption and a small “Dau, Malang” locator. On mobile, stack with the visual
cropped to a wide band.

**Ticker:** one dark forest strip with service facts, not a logo marquee.

**Highlights:** an editorial bento of five unequal panels:
large atmosphere panel, signature menu panel, late-night clock panel, facility
chips, and a quote panel. Use mixed surfaces (paper, forest, clay) but keep one
grid.

**Menu:** a printed menu ledger, not a product-card wall. Two columns on desktop,
one on mobile. Each row: name + description, dotted leader, price, circular add
button. A signature item gets a full-width feature row above the list.

**Gallery:** a contact sheet of numbered frames with varied crops. If real photos
are unavailable, use art-directed warm-light placeholders and label them clearly.

**Hours & location:** a ticket-like card. Hours table with today highlighted; a
hand-drawn SVG map with a pin and street labels. One clear “Buka di Maps” action.

**Order CTA:** full-bleed forest band with oversized “Mau pesan?” and one
WhatsApp action. No step-by-step card stack.

**Footer:** compact, with the large wordmark, contact, socials, and the demo
disclosure. Credits stay quiet.

---

## 6. Components

- **Status pill:** dot + “Buka sekarang · sampai 00.00”. Butter dot when open,
  clay when closed. Never fake live status.
- **Buttons:** primary forest fill with paper text, 12px radius, 48px min height.
  Secondary is a ruled outline. On hover-capable pointers, buttons lift 1px and
  shift any arrow 2px. Active press scales to 0.98.
- **Menu add control:** 40–44px circle, paper background, forest plus sign.
  On add, the cart bar is the feedback; do not animate the whole row. Press
  scales to 0.96. The plus does not rotate — a symmetric plus maps onto itself.
- **Cart bar:** a ticket stub fixed above the safe-area, forest fill, one clear
  “Lihat Pesanan” action and a quiet “Bersihkan”.
- **Order sheet:** bottom drawer on mobile, right-side panel on desktop. Sections:
  items, total, customer details, send/copy actions. Focus trapped, Escape closes.
- **Inputs:** paper-light fill, 1px line, 12px radius, visible focus ring in sage.
  All inputs have labels, `name`, and appropriate `autocomplete`.
- **Hours table:** tabular numerals, ruled rows, today marked with a small tag,
  not a filled row that destroys contrast.
- **Photo frame:** warm mat, 1px rule, numbered caption. Placeholder frames must
  look intentional, not like broken images.

---

## 7. Motion & Interaction

**Motion language:** warm, quick, physical. One easing family, no bounce except
the cart count feedback.

Tokens:
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`
- Durations: press `120–160ms`, hover `160–240ms`, small state `200ms`,
  drawer `280ms`, hero entrance `560ms`, scroll reveal `420ms`.

Rules:
- Animate `transform` and `opacity` only. Never `transition: all`.
- Nav underline uses `transform: scaleX()` with a left origin, never `right`.
- Hero content may enter once with a 40–50ms stagger; it must be visible without JS.
- Scroll reveal is limited to section-level groups and 6–8 cards, never long lists.
- Hover motion only inside `@media (hover: hover) and (pointer: fine)`.
- Reduced motion keeps color and opacity changes, removes movement and loops.
- `?motion=off` must be fully still: no header slide, card lift, gallery zoom, or
  icon shift. The active nav underline stays visible without a transition.
- Keyboard actions and frequent controls get no entrance animation.
- Never animate width, height, top, left, right, margin, or padding.
- Cart count feedback uses WAAPI, not a class toggle plus forced reflow.
- Lightbox entry uses `@starting-style`; print forces entrance content visible.
- Audit record: `docs/motion-review.md`.

---

## 8. Voice & Brand

**Language:** Indonesian, plain and warm. Short sentences. Local specificity.
No corporate filler, no “solusi kuliner terbaik”, no invented awards or reviews.

Tone examples:
- “Buka sampai tengah malam. Tempat pas untuk obrolan yang belum selesai.”
- “Pilih menu, kirim lewat WhatsApp. Kami konfirmasi langsung.”
- “Dau, Kabupaten Malang.”

Brand facts must come from `data.js`. The site is a **design demo** until the
cafe supplies a real phone number, address, photos, and menu approval. Keep the
“Contoh desain” disclosure visible.

---

## 9. Anti-patterns

Do not:
- Put the whole page in centered, equal-width rounded cards.
- Use floating blurred blobs as the main hero visual.
- Use glassmorphism panels over a gradient just to look “premium”.
- Use low-contrast sage text at 12px on cream.
- Use `transition: all`, `ease-in` entrances, `scale(0)`, or keyframe bounces on
  rapidly repeated controls.
- Hide all content behind scroll reveal until JavaScript runs.
- Use stock-photo URLs, fake Instagram embeds, or invented customer quotes.
- Use more than two typefaces, more than three accent colors, or a different
  radius on every component.
- Add a fake live “open” state that ignores the cafe's timezone and hours.
- Leave demo content unlabeled.
