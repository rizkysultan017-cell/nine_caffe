const test = require("node:test");
const assert = require("node:assert/strict");

const core = require("../cafe-core.js");

const HOURS = {
  0: [13, 24],
  1: [13, 24],
  2: [13, 24],
  3: [13, 24],
  4: [13, 24],
  5: [13, 24],
  6: [13, 24],
};

test("formatRupiah writes Indonesian thousands without decimals", () => {
  assert.equal(core.formatRupiah(22000), "Rp 22.000");
  assert.equal(core.formatRupiah(0), "Rp 0");
  assert.equal(core.formatRupiah(1234567), "Rp 1.234.567");
});

test("formatRupiah falls back to zero for invalid input", () => {
  assert.equal(core.formatRupiah(Number.NaN), "Rp 0");
  assert.equal(core.formatRupiah("not a price"), "Rp 0");
});

test("formatHour wraps past-midnight closing times", () => {
  assert.equal(core.formatHour(13), "13.00");
  assert.equal(core.formatHour(24), "00.00");
  assert.equal(core.formatHour(26), "02.00");
  assert.equal(core.formatHour(0), "00.00");
});

test("getOpenStatus reports open during service hours", () => {
  const status = core.getOpenStatus(HOURS, { day: 1, hour: 13, minute: 0 });
  assert.equal(status.open, true);
  assert.equal(status.closeToday, 24);
});

test("getOpenStatus reports closed before opening and names today as next open", () => {
  const status = core.getOpenStatus(HOURS, { day: 1, hour: 12, minute: 0 });
  assert.equal(status.open, false);
  assert.equal(status.nextLabel, "hari ini");
  assert.equal(status.nextOpen, 13);
});

test("getOpenStatus reports closed after midnight and reopens today", () => {
  const status = core.getOpenStatus(HOURS, { day: 2, hour: 0, minute: 30 });
  assert.equal(status.open, false);
  assert.equal(status.nextLabel, "hari ini");
  assert.equal(status.nextOpen, 13);
});

test("getOpenStatus carries over a close time past midnight", () => {
  const lateHours = { ...HOURS, 1: [13, 26] };
  const status = core.getOpenStatus(lateHours, { day: 2, hour: 1, minute: 0 });
  assert.equal(status.open, true);
  assert.equal(status.closeToday, 26);
  assert.equal(status.fromYesterday, true);
});

test("getOpenStatus names tomorrow when today is closed all day", () => {
  const closedMonday = { ...HOURS, 1: null };
  const status = core.getOpenStatus(closedMonday, { day: 1, hour: 20, minute: 0 });
  assert.equal(status.open, false);
  assert.equal(status.nextLabel, "besok");
  assert.equal(status.nextOpen, 13);
});

test("getOpenStatus reports no next opening when every day is closed", () => {
  const status = core.getOpenStatus({}, { day: 1, hour: 12, minute: 0 });
  assert.equal(status.open, false);
  assert.equal(status.nextLabel, "");
  assert.equal(status.nextOpen, null);
});

const MENU = [
  { name: "Kopi Susu Senja", desc: "Susu creamy + gula aren" },
  { name: "Matcha Latte", desc: "Matcha asli" },
  { name: "Roti Bakar", desc: "Cokelat keju" },
];

test("filterMenu matches name and description case-insensitively", () => {
  assert.deepEqual(core.filterMenu(MENU, "KOPI").map((item) => item.name), ["Kopi Susu Senja"]);
  assert.deepEqual(core.filterMenu(MENU, "gula aren").map((item) => item.name), ["Kopi Susu Senja"]);
  assert.deepEqual(core.filterMenu(MENU, "  ").length, 3);
  assert.deepEqual(core.filterMenu(MENU, "tidak ada"), []);
});

test("cartTotal and cartCount ignore invalid rows", () => {
  const cart = [
    { name: "Kopi", price: 22000, qty: 2 },
    { name: "Roti", price: 18000, qty: 1 },
    { name: "Rusak", price: 0, qty: 5 },
  ];
  assert.equal(core.cartTotal(cart), 62000);
  assert.equal(core.cartCount(cart), 3);
  assert.equal(core.cartTotal([]), 0);
  assert.equal(core.cartCount([]), 0);
});

test("normalizeStoredCart repairs valid rows, merges duplicates, and drops junk", () => {
  const result = core.normalizeStoredCart({
    items: [
      { name: "Kopi", price: 22000, qty: 2, note: "less sugar" },
      { name: "", price: 1000, qty: 1 },
      { name: "Rusak", price: 0, qty: 1 },
      { name: "Mie", price: "18000", qty: "2", note: 5 },
      { name: "Kopi", price: 22000, qty: 1, note: "abaikan" },
      { name: "Teh", price: 12000 },
    ],
    meta: { name: "Ayu", type: "Antar", table: 5, note: "pedas" },
  });

  assert.deepEqual(result.items, [
    { name: "Kopi", price: 22000, qty: 3, note: "less sugar" },
    { name: "Mie", price: 18000, qty: 2, note: "" },
    { name: "Teh", price: 12000, qty: 1, note: "" },
  ]);
  assert.deepEqual(result.meta, {
    name: "Ayu",
    type: "Antar",
    table: "5",
    note: "pedas",
  });
});

test("normalizeStoredCart restores the legacy cart snapshot shape", () => {
  const result = core.normalizeStoredCart({
    cart: [{ name: "Kopi", price: 22000, qty: 2, note: "" }],
    meta: { name: "Ayu", type: "Ambil", table: "", note: "" },
  });

  assert.deepEqual(result.items, [{ name: "Kopi", price: 22000, qty: 2, note: "" }]);
  assert.equal(result.meta.name, "Ayu");
  assert.equal(result.meta.type, "Ambil");
});

test("normalizeStoredCart falls back to safe defaults", () => {
  assert.deepEqual(core.normalizeStoredCart(null), {
    items: [],
    meta: { name: "", type: "Makan di tempat", table: "", note: "" },
  });
  assert.deepEqual(core.normalizeStoredCart({ items: "junk", meta: { type: "Drive thru" } }), {
    items: [],
    meta: { name: "", type: "Makan di tempat", table: "", note: "" },
  });
  assert.deepEqual(core.normalizeStoredCart({ items: [], meta: { type: "Ambil" } }).meta.type, "Ambil");
});

test("getOrderId uses the local date, prefix, and injected random value", () => {
  assert.equal(core.getOrderId("NC", new Date(2026, 9, 19), 0), "NC-191026-100");
  assert.equal(core.getOrderId("NC", new Date(2026, 0, 2), 0.5), "NC-020126-550");
});

const CAFE_FIXTURE = { name: "Nine Cafe & Eatery" };
const CART_FIXTURE = [
  { name: "Kopi Susu Senja", price: 22000, qty: 2, note: "less sugar" },
  { name: "Roti Bakar", price: 20000, qty: 1, note: "" },
];

test("buildOrderMessage produces the exact WhatsApp order text", () => {
  const message = core.buildOrderMessage({
    cafe: CAFE_FIXTURE,
    cart: CART_FIXTURE,
    meta: { name: "Ayu", type: "Makan di tempat", table: "5", note: "" },
    id: "NC-191026-100",
  });

  assert.equal(
    message,
    [
      "Halo Nine Cafe & Eatery, saya mau pesan.",
      "ID: NC-191026-100",
      "",
      "1. Kopi Susu Senja x2 = Rp 44.000",
      "   Catatan: less sugar",
      "2. Roti Bakar x1 = Rp 20.000",
      "",
      "Perkiraan total: Rp 64.000",
      "Jenis: Makan di tempat (Meja 5)",
      "Nama: Ayu",
      "Catatan: -",
    ].join("\n")
  );
});

test("buildOrderMessage only adds a table for dine-in and uses dashes for empty fields", () => {
  const message = core.buildOrderMessage({
    cafe: CAFE_FIXTURE,
    cart: CART_FIXTURE,
    meta: { name: "", type: "Ambil", table: "9", note: "jangan pedas" },
    id: "NC-191026-100",
  });

  assert.match(message, /Jenis: Ambil\n/);
  assert.doesNotMatch(message, /Meja 9/);
  assert.match(message, /Nama: -\n/);
  assert.match(message, /Catatan: jangan pedas/);
});

const MENU_FIXTURE = [
  { name: "Aren Latte", price: 18000 },
  { name: "Nasi Goreng Special", price: 20000 },
];

test("cartForMenu drops items that are no longer on the menu", () => {
  const cart = [
    { name: "Aren Latte", price: 18000, qty: 1, note: "" },
    { name: "Kopi Susu Senja", price: 22000, qty: 2, note: "" },
    { name: "Roti Bakar", price: 20000, qty: 1, note: "" },
  ];

  const cleaned = core.cartForMenu(cart, MENU_FIXTURE);

  assert.deepEqual(cleaned.map((item) => item.name), ["Aren Latte"]);
});

test("cartForMenu reprices kept items from the current menu and trims names", () => {
  const cart = [{ name: "  aren latte ", price: 999, qty: 2, note: "less ice" }];

  const cleaned = core.cartForMenu(cart, MENU_FIXTURE);

  assert.deepEqual(cleaned, [
    { name: "Aren Latte", price: 18000, qty: 2, note: "less ice" },
  ]);
});

test("cartForMenu defaults missing quantities and floors decimals", () => {
  const cart = [
    { name: "Aren Latte" },
    { name: "Nasi Goreng Special", qty: 2.7, note: "pedas" },
  ];

  const cleaned = core.cartForMenu(cart, MENU_FIXTURE);

  assert.deepEqual(cleaned, [
    { name: "Aren Latte", price: 18000, qty: 1, note: "" },
    { name: "Nasi Goreng Special", price: 20000, qty: 2, note: "pedas" },
  ]);
});

test("cartForMenu clamps quantities to the supplied maximum", () => {
  const cart = [{ name: "Aren Latte", qty: 500 }];

  const cleaned = core.cartForMenu(cart, MENU_FIXTURE, 99);

  assert.equal(cleaned[0].qty, 99);
});

test("cartForMenu ignores junk rows and does not mutate its inputs", () => {
  const cart = [
    null,
    { name: "", qty: 1 },
    { name: "Aren Latte", qty: 0 },
    { name: "Aren Latte", qty: -2 },
    { name: "Aren Latte", qty: "banyak" },
  ];

  const snapshot = JSON.stringify(cart);
  const cleaned = core.cartForMenu(cart, MENU_FIXTURE);

  assert.deepEqual(cleaned, []);
  assert.equal(JSON.stringify(cart), snapshot);
});
