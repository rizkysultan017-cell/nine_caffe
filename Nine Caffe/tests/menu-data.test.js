"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const CAFE = require("../data.js");

const EXPECTED_MENU = {
  "Coffee Based": {
    "Aren Latte": 18000,
    "Caramel Latte": 18000,
    "Butterscooth Latte": 18000,
    "Vanilla Latte": 18000,
    "Coffee Latte": 18000,
    "Americano": 15000,
  },
  "Milk Based": {
    "Choco Latte": 18000,
    "Matcha Latte": 18000,
    "Cha Thai": 18000,
    "Milky Oreo": 18000,
    "Milky Berry": 18000,
  },
  Refresher: {
    "Lychee Tea": 15000,
    "Lemon Breeze": 15000,
    "Jasmine Tea": 15000,
  },
  "Main Course": {
    "Nasi Goreng Special": 20000,
    "Spicy Pop": 20000,
    "Cheezy Pop": 20000,
    Indomie: 15000,
  },
  "Snack Based": {
    "Mix Platter": 20000,
    "Frenchy Fries": 16000,
    Cireng: 15000,
    "Bakwan Sayur": 10000,
    "Mix Donuts": 15000,
    "Cho-Cheese Banana": 15000,
    "Signature Banana": 15000,
  },
};

test("menu categories match the menu keys in order", () => {
  assert.deepEqual(CAFE.categories, Object.keys(EXPECTED_MENU));
  assert.deepEqual(Object.keys(CAFE.menu), Object.keys(EXPECTED_MENU));
});

test("every supplied menu item keeps its name and price", () => {
  for (const [category, items] of Object.entries(EXPECTED_MENU)) {
    const actual = CAFE.menu[category].map((item) => [item.name, item.price]);
    assert.deepEqual(actual, Object.entries(items));
  }
});

test("menu has 25 items and every item is orderable", () => {
  const items = Object.values(CAFE.menu).flat();
  assert.equal(items.length, 25);

  for (const item of items) {
    assert.ok(item.name.trim().length > 0, "item name is required");
    assert.ok(Number.isInteger(item.price) && item.price > 0, item.name + " needs a positive integer price");
    assert.equal(item.demo, false, item.name + " is supplied menu data, not a demo row");
  }
});

test("checked-in demo placeholders stay visibly marked", () => {
  assert.equal(CAFE.sample, true, "sample badge must stay until the site is approved");
  assert.equal(CAFE.waNumber, "628XXXXXXXXXX", "do not invent a live WhatsApp number");
  assert.deepEqual(CAFE.gallery, [], "gallery stays empty until real photos are allowed");
});
