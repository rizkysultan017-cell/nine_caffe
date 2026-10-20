# Architecture Review — Nine Cafe & Eatery

**Scope:** the revised static site (`index.html`, `style.css`, `app.js`, `cafe-core.js`,
`data.js`) after the menu/logo content update.
**Vocabulary:** module, interface, implementation, seam, adapter, depth, leverage,
locality (see `codebase-design`).

---

## 1. The module that earns its keep: `cafe-core.js`

`cafe-core.js` is a UMD-style module with no DOM access. It runs in the browser as
`window.NineCafeCore` and under `node --test` as a CommonJS export.

**Interface (everything a caller must know):**

| Function | Contract |
| --- | --- |
| `formatRupiah(value)` | Indonesian thousands, no decimals; invalid input → `Rp 0` |
| `formatHour(value)` | 24-hour dot format, wraps past midnight (24 → `00.00`) |
| `getOpenStatus(hours, now)` | Open/closed with next-open label; handles close times above 24 |
| `filterMenu(items, query)` | Case-insensitive match on `name` and `desc`; empty query returns a copy |
| `cartTotal(cart)` | Sums only valid rows; ignores zero, negative, non-numeric |
| `cartCount(cart)` | Same validation, returns item count not row count |
| `normalizeStoredCart(data)` | Repairs stored carts; merges duplicate names; drops junk; accepts legacy `{cart}` and current `{items}` |
| `cartForMenu(cart, menu, maxQty)` | Drops items no longer on the current menu, reprices the rest from the menu, clamps quantity |
| `getOrderId(prefix, date, random)` | `NC-DDMMYY-NNN`, injectable date/random for tests |
| `buildOrderMessage(input)` | Exact WhatsApp text; dashes for empty name/note; table only for dine-in |

**Invariants the interface hides:** negative quantities never reach totals, duplicate
carts merge instead of rendering twice, invalid stored rows cannot crash the page,
and the message never claims a table number for pickup orders.

**Depth:** ten small functions sit in front of price parsing, hour wrapping,
past-midnight open carry-over, cart repair, duplicate merging, menu migration,
and message formatting. Tests exercise the same seam a caller uses; there is no
test-only export or hidden backdoor. The suite now has **26 tests**.

---

## 2. Seam and adapters

| Role | File | Notes |
| --- | --- | --- |
| Pure module | `cafe-core.js` | Ordering, hours, formatting, message rules |
| Content source | `data.js` | Menu, hours, cafe facts, demo placeholders |
| DOM adapter | `app.js` | Rendering, events, focus, localStorage, clipboard |
| Test adapter | `tests/cafe-core.test.js`, `tests/menu-data.test.js` | Node's test runner crosses the same interface |

The only environment branch is the UMD wrapper. There is no second DOM adapter
and no bundler, so the seam stays small. `app.js` may not re-implement core rules;
it calls `core.normalizeStoredCart`, `core.cartForMenu`, `core.cartTotal`,
`core.filterMenu`, `core.buildOrderMessage`, and `core.getOpenStatus`.

---

## 3. Deletion test

Delete `cafe-core.js` and the complexity reappears in at least six places in
`app.js`: cart rendering, cart total, cart count, storage repair, stale-menu
migration, and order message building. Hours logic would split between the badge,
the bento card, the hours table, and the ticker. That is the definition of a
module earning its keep. It stays.

---

## 4. Locality wins from this revision

1. **Price formatting** lives once. The menu ledger, cart bar, sheet total, and
   WhatsApp message cannot drift.
2. **Cart repair and menu migration** live once. The legacy storage bug and the
   post-menu-update stale-item bug were each fixed in one function and covered by
   regression tests instead of guards at each call site.
3. **Menu data** is pinned by `tests/menu-data.test.js`: categories, 25 items,
   every name/price pair, and the demo placeholders that must not be “cleaned up”
   before approval.
4. **Order message** is a pure function. The browser flow, the copy button, and
   the WhatsApp fallback all produce the same text.

---

## 5. What is shallow, and that is fine

- `data.js` is a plain literal. It is content, not logic; a deep interface here
  would be ceremony.
- `app.js` is deliberately shallow: one `init()` wires elements to core calls.
  Keeping it shallow protects the core from DOM concerns.
- `server.mjs` is a 64-line preview server, not production infrastructure. It has
  one job and no configuration surface.

---

## 6. Next deepening opportunities (not required for approval)

| Opportunity | Why it could pay off | Cost |
| --- | --- | --- |
| `describeOrder(input)` returning `{message, total, count}` | One call for the sheet, the copy path, and a future receipt/print view | low |
| Gallery adapter | When real photos arrive, isolate `CAFE.gallery` rendering from `app.js` so the placeholder and photo branches stay testable | medium |
| `quoteOrder(input)` pure helper | If online payment or order preview arrives, the total and ID rules stay outside the DOM | low |

`cartForMenu` was implemented during this revision because the menu changed once
already; that risk is now covered. None of the remaining ideas block approval.
