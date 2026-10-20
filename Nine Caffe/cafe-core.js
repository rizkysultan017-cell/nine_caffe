/* ============================================================
   NINE CAFE & EATERY — cafe-core.js
   Deep module for ordering and opening-hours rules.
   No DOM access. Runs in the browser and under node --test.
   ============================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NineCafeCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  function asNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function formatRupiah(value) {
    const number = asNumber(value);
    if (number === null) return "Rp 0";
    return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(number);
  }

  function formatHour(value) {
    const number = asNumber(value);
    if (number === null) return "00.00";
    const hour = ((Math.floor(number) % 24) + 24) % 24;
    return String(hour).padStart(2, "0") + ".00";
  }

  function openingFor(hours, day) {
    const entry = hours ? hours[day] : null;
    if (!Array.isArray(entry)) return null;
    const opens = asNumber(entry[0]);
    const closes = asNumber(entry[1]);
    if (opens === null || closes === null || closes <= opens) return null;
    return { opens, closes };
  }

  function getOpenStatus(hours, now) {
    const day = asNumber(now && now.day);
    const hour = asNumber(now && now.hour);
    const minute = asNumber(now && now.minute);
    const currentDay = ((day === null ? 0 : Math.floor(day)) % 7 + 7) % 7;
    const nowMinutes = (hour === null ? 0 : Math.floor(hour)) * 60 + (minute === null ? 0 : Math.floor(minute));

    const today = openingFor(hours, currentDay);
    if (today && nowMinutes >= today.opens * 60 && nowMinutes < today.closes * 60) {
      return { open: true, closeToday: today.closes };
    }

    const yesterday = openingFor(hours, (currentDay + 6) % 7);
    if (yesterday && yesterday.closes > 24) {
      const remaining = yesterday.closes - 24;
      if (nowMinutes < remaining * 60) {
        return { open: true, closeToday: yesterday.closes, fromYesterday: true };
      }
    }

    for (let offset = 0; offset <= 7; offset++) {
      const nextDay = (currentDay + offset) % 7;
      const next = openingFor(hours, nextDay);
      if (!next) continue;
      if (offset === 0 && nowMinutes >= next.opens * 60) continue;
      return {
        open: false,
        nextLabel: offset === 0 ? "hari ini" : offset === 1 ? "besok" : DAY_NAMES[nextDay],
        nextOpen: next.opens,
        nextDayOffset: offset,
      };
    }

    return { open: false, nextLabel: "", nextOpen: null, nextDayOffset: null };
  }

  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function filterMenu(items, query) {
    const list = Array.isArray(items) ? items : [];
    const needle = normalizeText(query).toLowerCase();
    if (!needle) return list.slice();
    return list.filter((item) => {
      if (!item || typeof item !== "object") return false;
      return (
        normalizeText(item.name).toLowerCase().includes(needle) ||
        normalizeText(item.desc).toLowerCase().includes(needle)
      );
    });
  }

  function cartTotal(cart) {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => {
      if (!item || typeof item !== "object") return sum;
      const price = asNumber(item.price);
      const qty = asNumber(item.qty);
      if (price === null || price <= 0 || qty === null || qty <= 0) return sum;
      return sum + price * Math.floor(qty);
    }, 0);
  }

  function cartCount(cart) {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => {
      if (!item || typeof item !== "object") return sum;
      const qty = asNumber(item.qty);
      const price = asNumber(item.price);
      if (qty === null || qty <= 0 || price === null || price <= 0) return sum;
      return sum + Math.floor(qty);
    }, 0);
  }

  function normalizeStoredCart(data) {
    const defaultMeta = { name: "", type: "Makan di tempat", table: "", note: "" };
    if (!data || typeof data !== "object") return { items: [], meta: defaultMeta };

    const rawMeta = data.meta && typeof data.meta === "object" ? data.meta : {};
    const validTypes = ["Makan di tempat", "Ambil", "Antar"];
    const meta = {
      name: normalizeText(rawMeta.name),
      type: validTypes.includes(rawMeta.type) ? rawMeta.type : defaultMeta.type,
      table:
        typeof rawMeta.table === "number" && Number.isFinite(rawMeta.table)
          ? String(rawMeta.table)
          : normalizeText(rawMeta.table),
      note: normalizeText(rawMeta.note),
    };

    const items = [];
    const byName = new Map();
    const rows = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.cart)
        ? data.cart
        : [];

    rows.forEach((row) => {
      if (!row || typeof row !== "object") return;
      const name = normalizeText(row.name);
      const price = asNumber(row.price);
      if (!name || price === null || price <= 0) return;

      let qty = 1;
      if (row.qty !== undefined && row.qty !== null && row.qty !== "") {
        const parsedQty = asNumber(row.qty);
        if (parsedQty === null || parsedQty < 1) return;
        qty = Math.floor(parsedQty);
      }

      const note = normalizeText(row.note);
      const existing = byName.get(name);
      if (existing) {
        existing.qty += qty;
        if (!existing.note && note) existing.note = note;
        return;
      }

      const item = { name, price, qty, note };
      byName.set(name, item);
      items.push(item);
    });

    return { items, meta };
  }

  function cartForMenu(cart, menu, maxQty) {
    const rows = Array.isArray(cart) ? cart : [];
    const capValue = asNumber(maxQty);
    const cap = capValue !== null && capValue >= 1 ? Math.floor(capValue) : Infinity;
    const current = new Map();

    (Array.isArray(menu) ? menu : []).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const name = normalizeText(item.name);
      const price = asNumber(item.price);
      if (!name || price === null || price <= 0) return;
      current.set(name.toLowerCase(), { name, price });
    });

    const items = [];
    rows.forEach((row) => {
      if (!row || typeof row !== "object") return;
      const known = current.get(normalizeText(row.name).toLowerCase());
      if (!known) return;

      let qty = 1;
      if (row.qty !== undefined && row.qty !== null && row.qty !== "") {
        const parsedQty = asNumber(row.qty);
        if (parsedQty === null || parsedQty < 1) return;
        qty = Math.floor(parsedQty);
      }

      items.push({
        name: known.name,
        price: known.price,
        qty: Math.min(qty, cap),
        note: normalizeText(row.note),
      });
    });

    return items;
  }

  function getOrderId(prefix, date, random) {
    const value = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yy = String(value.getFullYear()).slice(-2);
    const seed = typeof random === "number" && Number.isFinite(random) ? random : Math.random();
    const clamped = Math.min(Math.max(seed, 0), 0.999999);
    const suffix = Math.floor(100 + clamped * 900);
    return String(prefix || "NC") + "-" + dd + mm + yy + "-" + suffix;
  }

  function buildOrderMessage(input) {
    const data = input || {};
    const cafe = data.cafe || {};
    const cart = Array.isArray(data.cart) ? data.cart : [];
    const meta = data.meta || {};
    const name = normalizeText(cafe.name) || "Nine Cafe & Eatery";
    const type = normalizeText(meta.type) || "Makan di tempat";
    const lines = [];

    lines.push("Halo " + name + ", saya mau pesan.");
    lines.push("ID: " + (normalizeText(data.id) || getOrderId("NC")));
    lines.push("");
    cart.forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const itemName = normalizeText(item.name);
      const price = asNumber(item.price);
      const qty = asNumber(item.qty);
      if (!itemName || price === null || price <= 0 || qty === null || qty <= 0) return;
      const amount = Math.floor(qty);
      lines.push(index + 1 + ". " + itemName + " x" + amount + " = " + formatRupiah(price * amount));
      const note = normalizeText(item.note);
      if (note) lines.push("   Catatan: " + note);
    });
    lines.push("");
    lines.push("Perkiraan total: " + formatRupiah(cartTotal(cart)));
    const table = normalizeText(meta.table);
    lines.push("Jenis: " + type + (type === "Makan di tempat" && table ? " (Meja " + table + ")" : ""));
    lines.push("Nama: " + (normalizeText(meta.name) || "-"));
    lines.push("Catatan: " + (normalizeText(meta.note) || "-"));
    return lines.join("\n");
  }

  return {
    formatRupiah,
    formatHour,
    getOpenStatus,
    filterMenu,
    cartTotal,
    cartCount,
    normalizeStoredCart,
    cartForMenu,
    getOrderId,
    buildOrderMessage,
  };
});
