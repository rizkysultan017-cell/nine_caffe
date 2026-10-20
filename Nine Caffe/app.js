/* ============================================================
   NINE CAFE & EATERY — app.js
   DOM wiring for the Dusk Coffee Ledger revision.
   Ordering, hours, and message rules live in cafe-core.js.
   ============================================================ */

(function () {
  "use strict";

  const core = window.NineCafeCore;
  if (!core) {
    console.error("Nine Cafe: cafe-core.js must load before app.js.");
    return;
  }

  if (typeof CAFE === "undefined" || !CAFE) {
    console.error("Nine Cafe: data.js must load before app.js.");
    return;
  }

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  const STORAGE_KEY = "nine-cafe-cart-v1";
  const MAX_QTY = 99;
  const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const params = new URLSearchParams(window.location.search);
  const desktopQuery = window.matchMedia("(min-width: 900px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOff = params.get("motion") === "off" || prefersReducedMotion;

  const dom = {
    header: $("#siteHeader"),
    navLinks: $$(".site-nav a"),
    skipLink: $(".skip-link"),
    main: $("#main"),
    footer: $(".footer"),

    openBadge: $("#openBadge"),
    openBadgeText: $("#openBadgeText"),
    waHeroBtn: $("#waHeroBtn"),
    tickerTrack: $("#tickerTrack"),
    bentoGrid: $("#bentoGrid"),

    pillBar: $("#pillBar"),
    menuSearch: $("#menuSearch"),
    menuCount: $("#menuCount"),
    menuGrid: $("#menuGrid"),
    menuEmpty: $("#menuEmpty"),
    menuNote: $("#menuNote"),
    menuSection: $("#menu"),

    galleryGrid: $("#galleryGrid"),
    gallerySection: $("#suasana"),
    galleryIntro: $("#galleryIntro"),
    galleryNote: $("#galleryNote"),

    hoursTable: $("#hoursTable"),
    cafeAddress: $("#cafeAddress"),
    mapsBtn: $("#mapsBtn"),
    waBigBtn: $("#waBigBtn"),
    visitSection: $("#kunjungan"),

    footerNote: $("#footerNote"),
    footerContact: $("#footerContact"),
    footerSocial: $("#footerSocial"),
    sampleBadge: $("#sampleBadge"),

    cartBar: $("#cartBar"),
    cartCount: $("#cartCount"),
    cartTotal: $("#cartTotal"),
    cartBarOpen: $("#cartBarOpen"),
    cartClear: $("#cartClear"),

    sheetBackdrop: $("#sheetBackdrop"),
    orderSheet: $("#orderSheet"),
    sheetClose: $("#sheetClose"),
    sheetItems: $("#sheetItems"),
    sheetEmpty: $("#sheetEmpty"),
    sheetTotal: $("#sheetTotal"),
    orderName: $("#orderName"),
    orderType: $("#orderType"),
    orderTable: $("#orderTable"),
    tableField: $("#tableField"),
    orderNote: $("#orderNote"),
    sendWaBtn: $("#sendWaBtn"),
    copyOrderBtn: $("#copyOrderBtn"),
    waModeNote: $("#waModeNote"),

    lightbox: $("#lightbox"),
    lightboxImg: $("#lightboxImg"),
    lightboxCaption: $("#lightboxCaption"),
    lightboxClose: $("#lightboxClose"),
    lightboxPrev: $("#lightboxPrev"),
    lightboxNext: $("#lightboxNext"),

    toast: $("#siteToast"),
    orderAnnouncer: $("#orderAnnouncer"),
  };

  const categories = (Array.isArray(CAFE.categories) ? CAFE.categories : []).filter(
    (category) => category && CAFE.menu && Array.isArray(CAFE.menu[category])
  );

  const allMenuItems = [];
  categories.forEach((category) => {
    CAFE.menu[category].forEach((item) => {
      if (item && typeof item.name === "string" && item.name.trim()) {
        allMenuItems.push(Object.assign({}, item, { category }));
      }
    });
  });

  const photos = (Array.isArray(CAFE.gallery) ? CAFE.gallery : [])
    .filter((photo) => photo && typeof photo.src === "string" && photo.src.trim())
    .slice(0, 6);

  const waDigits = String(CAFE.waNumber || "").replace(/\D/g, "");
  const hasWhatsApp = /^62\d{8,13}$/.test(waDigits);

  const state = {
    cart: [],
    meta: { name: "", type: "Makan di tempat", table: "", note: "" },
    activeCategory: "Semua",
    query: "",
    sheetOpen: false,
    lightboxOpen: false,
    lightboxIndex: 0,
    lastSheetFocus: null,
    lastLightboxFocus: null,
    sessionOrderId: null,
    lastDay: null,
    currentSection: null,
    lastScrollY: window.scrollY,
    cartHideTimer: null,
    sheetTimer: null,
    toastHideTimer: null,
    toastRemoveTimer: null,
    announceTimer: null,
    urlTimer: null,
    scrollQueued: false,
  };

  const labelTimers = new WeakMap();
  const menuNames = new Map(allMenuItems.map((item) => [item.name.trim(), item]));

  /* ---------- Text helpers ---------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sentence(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return /[.!?]$/.test(text) ? text : text + ".";
  }

  function defaultInquiry() {
    return "Halo " + CAFE.name + ", saya mau tanya menu dan reservasi.";
  }

  function whatsappHref(message) {
    if (!hasWhatsApp) return null;
    return "https://wa.me/" + waDigits + "?text=" + encodeURIComponent(message);
  }

  /* ---------- Cafe time ---------- */

  function forcedDay() {
    const raw = params.get("hari");
    if (raw === null || raw === "") return null;
    const day = Number(raw);
    return Number.isInteger(day) && day >= 0 && day <= 6 ? day : null;
  }

  function cafeTime() {
    const requestedDay = forcedDay();
    const forced = params.get("jam");
    if (forced) {
      const match = forced.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
          return {
            day: requestedDay === null ? new Date().getDay() : requestedDay,
            hour,
            minute,
          };
        }
      }
    }

    try {
      const parts = {};
      new Intl.DateTimeFormat("en-US", {
        timeZone: CAFE.timezone || "Asia/Jakarta",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .formatToParts(new Date())
        .forEach((part) => {
          parts[part.type] = part.value;
        });

      const dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        day: requestedDay === null ? dayIndex[parts.weekday] : requestedDay,
        hour: parseInt(parts.hour, 10) % 24,
        minute: parseInt(parts.minute, 10),
      };
    } catch (error) {
      const now = new Date();
      return {
        day: requestedDay === null ? now.getDay() : requestedDay,
        hour: now.getHours(),
        minute: now.getMinutes(),
      };
    }
  }

  function statusCopy(status) {
    if (status.open) {
      return "Buka sekarang · sampai " + core.formatHour(status.closeToday);
    }
    if (status.nextOpen !== null) {
      return "Tutup · buka " + status.nextLabel + " " + core.formatHour(status.nextOpen);
    }
    return "Tutup sementara";
  }

  /* ---------- Toast + announcements ---------- */

  function showToast(message, duration, action) {
    window.clearTimeout(state.toastHideTimer);
    window.clearTimeout(state.toastRemoveTimer);
    dom.toast.textContent = "";
    const text = document.createElement("span");
    text.className = "toast-text";
    text.textContent = message;
    dom.toast.append(text);
    if (action && typeof action.onClick === "function") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toast-action";
      button.textContent = action.label || "Urungkan";
      button.addEventListener("click", () => {
        dom.toast.classList.remove("is-visible");
        dom.toast.hidden = true;
        action.onClick();
      });
      dom.toast.append(button);
    }
    dom.toast.hidden = false;
    window.requestAnimationFrame(() => dom.toast.classList.add("is-visible"));
    state.toastHideTimer = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
      state.toastRemoveTimer = window.setTimeout(() => {
        dom.toast.hidden = true;
      }, motionOff ? 0 : 220);
    }, typeof duration === "number" ? duration : 4200);
  }

  function announce(message) {
    window.clearTimeout(state.announceTimer);
    dom.orderAnnouncer.textContent = "";
    state.announceTimer = window.setTimeout(() => {
      dom.orderAnnouncer.textContent = message;
    }, 30);
  }

  function setButtonLabel(button, text) {
    const label = $(".btn-label", button);
    if (label) label.textContent = text;
  }

  function flashButtonLabel(button, temporary, original) {
    window.clearTimeout(labelTimers.get(button));
    setButtonLabel(button, temporary);
    labelTimers.set(
      button,
      window.setTimeout(() => setButtonLabel(button, original), 2400)
    );
  }

  /* ---------- Page chrome ---------- */

  function renderStatus() {
    const time = cafeTime();
    const status = core.getOpenStatus(CAFE.hours, time);
    const heroText = statusCopy(status);

    dom.openBadge.classList.toggle("is-open", status.open);
    dom.openBadge.classList.toggle("is-closed", !status.open);
    if (dom.openBadgeText.textContent !== heroText) {
      dom.openBadgeText.textContent = heroText;
    }

    const bentoStatus = $("[data-bento-status]", dom.bentoGrid);
    if (bentoStatus) {
      const bentoText = status.open
        ? "Buka sekarang · sampai " + core.formatHour(status.closeToday)
        : status.nextOpen !== null
          ? "Tutup sekarang · buka " + status.nextLabel + " " + core.formatHour(status.nextOpen)
          : "Tutup sementara";
      if (bentoStatus.textContent !== bentoText) bentoStatus.textContent = bentoText;
      bentoStatus.classList.toggle("is-closed", !status.open);
    }

    if (state.lastDay !== time.day) {
      renderHours();
    }
  }

  function renderTicker() {
    const schedule = CAFE.hours && Array.isArray(CAFE.hours[0]) ? CAFE.hours[0] : [13, 24];
    const items = [
      "Buka setiap hari " + core.formatHour(schedule[0]) + "–" + core.formatHour(schedule[1]),
      "Dau, Kabupaten Malang",
      "Kopi & santapan hangat",
      "Indoor & outdoor",
      "Pesan langsung via WhatsApp",
    ];
    dom.tickerTrack.innerHTML = items
      .map((item) => "<span>" + escapeHtml(item) + "</span>")
      .join("");
  }

  function renderBento() {
    const highlights = Array.isArray(CAFE.highlights) ? CAFE.highlights : [];
    const findHighlight = (pattern) =>
      highlights.find((entry) => entry && pattern.test(String(entry.title || "")));
    const atmosphere = findHighlight(/suasana/i);
    const facilitiesHighlight = findHighlight(/fasilitas/i);
    const orderHighlight = findHighlight(/pesan/i);

    const firstCategory = categories[0];
    const signatureItems = allMenuItems
      .filter((item) => item.category === firstCategory)
      .slice(0, 3);
    const signature = signatureItems.length ? signatureItems : allMenuItems.slice(0, 3);

    const schedule = CAFE.hours && Array.isArray(CAFE.hours[0]) ? CAFE.hours[0] : [13, 24];
    const facilities = Array.isArray(CAFE.facilities) ? CAFE.facilities : [];
    const waIcon =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';
    const arrowIcon =
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const signatureMarkup = signature.length
      ? signature
          .map(
            (item) =>
              '<div class="signature-item">' +
              '<span class="signature-name">' + escapeHtml(item.name) + "</span>" +
              '<span class="signature-dots" aria-hidden="true"></span>' +
              '<span class="signature-price">' + core.formatRupiah(item.price) + "</span>" +
              "</div>"
          )
          .join("")
      : '<p class="signature-note">Pilihan signature akan tampil setelah menu cafe dikonfirmasi.</p>';

    const chips = facilities
      .map((facility) => '<span class="facility-chip">' + escapeHtml(facility) + "</span>")
      .join("");

    dom.bentoGrid.innerHTML =
      '<article class="bento-card bento-card--scene reveal" style="--i:0">' +
      '<div class="bento-scene" aria-hidden="true">' +
      '<span class="bento-scene-label">Malam di Nine</span>' +
      '<span class="bento-scene-cup"></span>' +
      "</div>" +
      '<p class="bento-index">01 · Suasana</p>' +
      "<h3 class=\"bento-title\">Meja kayu, lampu hangat.</h3>" +
      '<p class="bento-text">' +
      escapeHtml(atmosphere ? atmosphere.text : "Tempat nongkrong hangat di Dau, Malang.") +
      "</p>" +
      "</article>" +
      '<article class="bento-card bento-card--signature reveal" style="--i:1">' +
      '<p class="bento-index">02 · Menu</p>' +
      '<h3 class="bento-title">Sekilas daftar menu.</h3>' +
      '<div class="signature-list">' +
      signatureMarkup +
      "</div>" +
      '<p class="signature-note">Harga mengikuti daftar menu cafe.</p>' +
      "</article>" +
      '<article class="bento-card bento-card--hours reveal" style="--i:2">' +
      '<p class="bento-index">03 · Jam</p>' +
      '<h3 class="bento-title">Buka sampai tengah malam.</h3>' +
      '<div class="hours-bento-top">' +
      '<p class="hours-bento-number">' +
      escapeHtml(schedule[0]) +
      "—" +
      escapeHtml(schedule[1]) +
      "</p>" +
      '<p class="hours-bento-label">Setiap hari<br />WIB</p>' +
      "</div>" +
      '<p class="hours-bento-status" data-bento-status>Buka setiap hari · 13.00—24.00</p>' +
      "</article>" +
      '<article class="bento-card bento-card--facilities reveal" style="--i:3">' +
      '<p class="bento-index">04 · Fasilitas</p>' +
      '<h3 class="bento-title">Buat tinggal lebih lama.</h3>' +
      '<p class="bento-text">' +
      escapeHtml(
        facilitiesHighlight
          ? facilitiesHighlight.text
          : "WiFi, parkir, dan ruang untuk bekerja atau berkumpul."
      ) +
      "</p>" +
      (chips ? '<div class="facility-chips">' + chips + "</div>" : "") +
      "</article>" +
      '<article class="bento-card bento-card--order reveal" style="--i:4">' +
      '<div class="order-bento-icon">' + waIcon + "</div>" +
      '<p class="bento-index">05 · Pesan</p>' +
      '<h3 class="bento-title">Pesan tanpa antre.</h3>' +
      '<p class="bento-text">' +
      escapeHtml(
        orderHighlight
          ? orderHighlight.text
          : "Pilih menu, lalu kirim pesanan lewat WhatsApp."
      ) +
      "</p>" +
      '<a class="bento-arrow" href="#menu">Mulai dari menu ' + arrowIcon + "</a>" +
      "</article>";
  }

  function renderHours() {
    const time = cafeTime();
    const rows = DAY_NAMES.map((name, index) => {
      const entry = CAFE.hours ? CAFE.hours[index] : null;
      const valid = Array.isArray(entry) && entry.length >= 2;
      const hours = valid
        ? core.formatHour(entry[0]) + " – " + core.formatHour(entry[1])
        : "Tutup";
      const today = index === time.day;
      return (
        '<tr class="' + (today ? "is-today" : "") + '"' +
        (today ? ' aria-current="date"' : "") +
        ">" +
        "<td>" + escapeHtml(name) +
        (today ? '<span class="today-tag">Hari ini</span>' : "") +
        "</td>" +
        "<td>" + hours + "</td>" +
        "</tr>"
      );
    });
    dom.hoursTable.innerHTML = rows.join("");
    state.lastDay = time.day;
  }

  function renderLocation() {
    dom.cafeAddress.textContent = CAFE.address || "Dau, Kabupaten Malang, Jawa Timur";
    dom.mapsBtn.href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(CAFE.address || "Dau, Kabupaten Malang");
  }

  function fillFooter() {
    dom.footerNote.textContent = sentence(CAFE.tagline);

    dom.footerContact.textContent = "";
    if (hasWhatsApp) {
      const link = document.createElement("a");
      link.className = "footer-link";
      link.href = whatsappHref(defaultInquiry());
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "WhatsApp: +" + waDigits;
      dom.footerContact.append(link);
    } else {
      dom.footerContact.textContent = "WhatsApp: nomor contoh";
    }

    dom.footerSocial.textContent = "";
    const instagram = String(CAFE.instagram || "").replace(/^@+/, "").trim();
    if (instagram) {
      const link = document.createElement("a");
      link.className = "footer-link";
      link.href = "https://instagram.com/" + encodeURIComponent(instagram);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Instagram: @" + instagram;
      dom.footerSocial.append(link);
    } else {
      dom.footerSocial.textContent = "Instagram menyusul";
    }

    dom.sampleBadge.hidden = !CAFE.sample;
  }

  function renderWaEntryPoints() {
    const inquiry = defaultInquiry();
    const link = whatsappHref(inquiry);

    if (link) {
      [dom.waHeroBtn, dom.waBigBtn].forEach((anchor) => {
        anchor.href = link;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.removeAttribute("title");
      });
      dom.waModeNote.hidden = true;
    } else {
      [dom.waHeroBtn, dom.waBigBtn].forEach((anchor) => {
        anchor.href = "#menu";
        anchor.removeAttribute("target");
        anchor.removeAttribute("rel");
        anchor.title = "Nomor WhatsApp cafe belum diisi — pilih menu, lalu salin pesanan.";
      });
      dom.waModeNote.hidden = false;
    }
  }

  /* ---------- Menu ---------- */

  function renderPills() {
    const options = ["Semua"].concat(categories);
    dom.pillBar.innerHTML = options
      .map((category) => {
        const pressed = category === state.activeCategory;
        const label = category === "Semua" ? "Semua kategori" : "Kategori " + category;
        return (
          '<button class="pill" type="button" data-cat="' + escapeHtml(category) + '"' +
          ' aria-pressed="' + String(pressed) + '" aria-label="' + escapeHtml(label) + '">' +
          escapeHtml(category) +
          "</button>"
        );
      })
      .join("");
  }

  function menuItemsForCategory() {
    if (state.activeCategory === "Semua") return allMenuItems;
    return allMenuItems.filter((item) => item.category === state.activeCategory);
  }

  function renderMenu() {
    const source = menuItemsForCategory();
    const filtered = core.filterMenu(source, state.query);
    const categoryLabel = state.activeCategory === "Semua" ? "semua kategori" : state.activeCategory;

    if (filtered.length === 0) {
      dom.menuGrid.innerHTML = "";
      dom.menuEmpty.hidden = false;
      dom.menuEmpty.textContent = state.query
        ? "Tidak ada menu untuk “" + state.query + "” di " + categoryLabel +
          ". Coba kata lain, atau pilih Semua kategori."
        : "Belum ada menu di kategori ini.";
    } else {
      dom.menuEmpty.hidden = true;
      dom.menuGrid.innerHTML = filtered
        .map((item) => {
          const demo = item.demo ? '<span class="menu-demo">Contoh</span>' : "";
          const tag = item.tag ? '<span class="menu-tag">' + escapeHtml(item.tag) + "</span>" : "";
          const categoryTag =
            state.activeCategory === "Semua"
              ? '<span class="menu-category">' + escapeHtml(item.category) + "</span> "
              : "";
          return (
            '<article class="menu-item" data-menu-item="' + escapeHtml(item.name) + '">' +
            '<div class="menu-item-head">' +
            '<h3 class="menu-name">' + escapeHtml(item.name) + "</h3>" +
            demo +
            tag +
            '<span class="menu-leader" aria-hidden="true"></span>' +
            '<span class="menu-price">' + core.formatRupiah(item.price) + "</span>" +
            "</div>" +
            (categoryTag || item.desc
              ? '<p class="menu-desc">' + categoryTag + escapeHtml(item.desc || "") + "</p>"
              : "") +
            '<button class="menu-add" type="button" data-order="' + escapeHtml(item.name) + '"' +
            ' data-price="' + escapeHtml(item.price) + '"' +
            ' aria-label="Tambah ' + escapeHtml(item.name) + ", " + core.formatRupiah(item.price) +
            ', ke pesanan">' +
            '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
            "</button>" +
            "</article>"
          );
        })
        .join("");
    }

    dom.menuNote.hidden = allMenuItems.length === 0;
    dom.menuCount.textContent = state.query
      ? filtered.length + " hasil untuk “" + state.query + "” · " + categoryLabel
      : filtered.length + " menu · " + categoryLabel;
  }

  function setCategory(category) {
    if (category !== "Semua" && categories.indexOf(category) === -1) return;
    state.activeCategory = category;
    $$(".pill", dom.pillBar).forEach((pill) => {
      pill.setAttribute("aria-pressed", String(pill.dataset.cat === category));
    });
    renderMenu();
    updateUrlState(true);
  }

  function findMenuItem(name) {
    return menuNames.get(String(name || "").trim()) || null;
  }

  function updateUrlState(immediate) {
    window.clearTimeout(state.urlTimer);
    const commit = () => {
      try {
        const url = new URL(window.location.href);
        if (state.activeCategory === "Semua") {
          url.searchParams.delete("kategori");
        } else {
          url.searchParams.set("kategori", state.activeCategory);
        }
        if (state.query) {
          url.searchParams.set("cari", state.query);
        } else {
          url.searchParams.delete("cari");
          url.searchParams.delete("q");
        }
        window.history.replaceState(null, "", url.href);
      } catch (error) {
        /* Local files and older browsers can refuse history updates. */
      }
    };
    if (immediate) commit();
    else state.urlTimer = window.setTimeout(commit, 220);
  }

  /* ---------- Gallery ---------- */

  function renderGallery() {
    if (photos.length > 0) {
      dom.galleryIntro.textContent =
        "Bingkai suasana dari Nine. Ketuk foto untuk melihatnya lebih besar.";
      dom.galleryNote.textContent = "Foto suasana Nine Cafe.";
      dom.galleryGrid.innerHTML = photos
        .map((photo, index) => {
          const alt = String(photo.alt || "Suasana Nine Cafe");
          return (
            '<button class="gallery-item gallery-item--photo reveal" type="button" data-index="' +
            index +
            '" style="--i:' + (index % 6) + '" aria-label="Perbesar foto: ' + escapeHtml(alt) + '">' +
            '<img src="' + escapeHtml(photo.src) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async" />' +
            '<span class="gallery-caption"><span>Foto ' + String(index + 1).padStart(2, "0") +
            "</span><span>" + escapeHtml(alt) + "</span></span>" +
            "</button>"
          );
        })
        .join("");
      return;
    }

    const placeholders = [
      { art: "a", index: "01", label: "Lampu meja", caption: "Cahaya hangat di sudut ruang." },
      { art: "b", index: "02", label: "Meja kayu", caption: "Permukaan kayu dan cangkir." },
      { art: "c", index: "03", label: "Jendela malam", caption: "Bingkai jendela setelah gelap." },
      { art: "d", index: "04", label: "Lampu gantung", caption: "Satu titik terang di atas meja." },
      { art: "e", index: "05", label: "Dinding angka", caption: "Monogram Sembilan." },
      { art: "f", index: "06", label: "Jalan menuju Nine", caption: "Dau, Kabupaten Malang." },
    ];

    dom.galleryIntro.textContent =
      "Enam bingkai suasana. Foto asli akan menggantikan ilustrasi ini setelah cafe mengizinkan.";
    dom.galleryNote.textContent = "Ilustrasi suasana, bukan foto lokasi sebenarnya.";
    dom.galleryGrid.innerHTML = placeholders
      .map(
        (frame, index) =>
          '<figure class="gallery-item gallery-item--placeholder reveal" style="--i:' + index + '">' +
          '<div class="gallery-art gallery-art--' + frame.art + '" aria-hidden="true"></div>' +
          '<figcaption class="gallery-caption">' +
          "<span>" + frame.index + " · Suasana</span>" +
          "<span>" + frame.label + "</span>" +
          "</figcaption>" +
          "</figure>"
      )
      .join("");
  }

  /* ---------- Cart bar + sheet ---------- */

  function cartData() {
    return { items: state.cart, meta: state.meta };
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData()));
    } catch (error) {
      /* Storage may be disabled; the page still works for this session. */
    }
  }

  function loadCart() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const normalized = core.normalizeStoredCart(JSON.parse(raw));
      state.cart = core.cartForMenu(normalized.items, allMenuItems, MAX_QTY);
      state.meta = normalized.meta;
    } catch (error) {
      state.cart = [];
      state.meta = { name: "", type: "Makan di tempat", table: "", note: "" };
    }
  }

  function bumpCartCount() {
    if (motionOff || typeof dom.cartCount.animate !== "function") return;
    if (typeof dom.cartCount.getAnimations === "function") {
      dom.cartCount.getAnimations().forEach((animation) => animation.cancel());
    }
    dom.cartCount.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.12)", offset: 0.45 },
        { transform: "scale(1)" },
      ],
      { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
  }

  function updateCartBar(options) {
    const settings = options || {};
    const count = core.cartCount(state.cart);
    window.clearTimeout(state.cartHideTimer);

    dom.cartCount.textContent = String(count);
    dom.cartTotal.textContent = core.formatRupiah(core.cartTotal(state.cart));

    if (count === 0) {
      document.body.classList.remove("has-cart");
      dom.cartBar.classList.remove("is-visible");
      if (settings.animate) {
        state.cartHideTimer = window.setTimeout(() => {
          if (core.cartCount(state.cart) === 0) dom.cartBar.hidden = true;
        }, 280);
      } else {
        dom.cartBar.hidden = true;
      }
      return;
    }

    document.body.classList.add("has-cart");
    if (dom.cartBar.hidden) {
      dom.cartBar.hidden = false;
      void dom.cartBar.offsetWidth;
    }

    if (settings.animate) {
      window.requestAnimationFrame(() => dom.cartBar.classList.add("is-visible"));
      bumpCartCount();
    } else {
      dom.cartBar.classList.add("is-visible");
    }
  }

  function addToCart(name) {
    const item = findMenuItem(name);
    if (!item) return;

    const existing = state.cart.find((entry) => entry.name === item.name);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, MAX_QTY);
      existing.price = item.price;
    } else {
      state.cart.push({ name: item.name, price: item.price, qty: 1, note: "" });
    }

    saveCart();
    updateCartBar({ animate: true });
    announce(
      item.name + " ditambahkan. " + core.cartCount(state.cart) +
      " item di pesanan, total " + core.formatRupiah(core.cartTotal(state.cart)) + "."
    );
  }

  function clearCart() {
    const removed = state.cart.slice();
    if (core.cartCount(removed) === 0) return;

    state.cart = [];
    state.sessionOrderId = null;
    saveCart();
    updateCartBar({ animate: true });
    if (state.sheetOpen) renderSheetItems();
    announce("Semua item di pesanan dihapus.");
    showToast("Pesanan dikosongkan.", 7000, {
      label: "Urungkan",
      onClick: () => {
        state.cart = removed;
        state.sessionOrderId = null;
        saveCart();
        updateCartBar({ animate: true });
        if (state.sheetOpen) renderSheetItems();
        announce(
          "Pesanan dikembalikan. " + core.cartCount(removed) +
          " item di pesanan, total " + core.formatRupiah(core.cartTotal(removed)) + "."
        );
        showToast("Pesanan dikembalikan.");
      },
    });
  }

  function renderSheetItems(focus) {
    const count = core.cartCount(state.cart);
    dom.sheetTotal.textContent = core.formatRupiah(core.cartTotal(state.cart));
    dom.sheetEmpty.hidden = count > 0;
    dom.sendWaBtn.disabled = count === 0;
    dom.copyOrderBtn.disabled = count === 0;

    if (count === 0) {
      dom.sheetItems.innerHTML = "";
      if (focus) dom.sheetClose.focus({ preventScroll: true });
      return;
    }

    dom.sheetItems.innerHTML = state.cart
      .map((item, index) => {
        const safeName = escapeHtml(item.name);
        const noteId = "sheet-note-" + index;
        return (
          '<div class="sheet-item" data-name="' + safeName + '">' +
          '<div class="sheet-item-main">' +
          '<div><p class="sheet-item-name">' + safeName + "</p>" +
          '<p class="sheet-item-price">' +
          (item.qty > 1 ? core.formatRupiah(item.price) + " · " : "") +
          core.formatRupiah(item.price * item.qty) + "</p></div>" +
          '<div class="sheet-item-controls" role="group" aria-label="Atur jumlah ' + safeName + '">' +
          '<button class="qty-btn" type="button" data-action="dec" data-name="' + safeName +
          '" aria-label="Kurangi ' + safeName + '">−</button>' +
          '<span class="qty-val"><span class="sr-only">Jumlah </span>' + item.qty + "</span>" +
          '<button class="qty-btn" type="button" data-action="inc" data-name="' + safeName +
          '" aria-label="Tambah ' + safeName + '"' + (item.qty >= MAX_QTY ? " disabled" : "") + ">+</button>" +
          '<button class="sheet-item-remove" type="button" data-action="remove" data-name="' + safeName +
          '" aria-label="Hapus ' + safeName + '">×</button>' +
          "</div>" +
          "</div>" +
          '<label class="sr-only" for="' + noteId + '">Catatan untuk ' + safeName + "</label>" +
          '<input class="sheet-item-note" id="' + noteId + '" type="text" maxlength="80"' +
          ' placeholder="Catatan item…" value="' + escapeHtml(item.note || "") + '"' +
          ' data-action="note" data-name="' + safeName + '" />' +
          "</div>"
        );
      })
      .join("");

    if (!focus) return;

    let target = null;
    if (focus.action && focus.name) {
      target = $$('button[data-action]', dom.sheetItems).find(
        (button) =>
          button.dataset.action === focus.action && button.dataset.name === focus.name
      );
    }
    if (!target || target.disabled) {
      target = $('button[data-action="inc"]:not([disabled])', dom.sheetItems) || dom.sheetClose;
    }
    target.focus({ preventScroll: true });
  }

  function renderSheetForm() {
    dom.orderName.value = state.meta.name || "";
    dom.orderType.value = state.meta.type || "Makan di tempat";
    dom.orderTable.value = state.meta.table || "";
    dom.orderNote.value = state.meta.note || "";
    dom.tableField.hidden = dom.orderType.value !== "Makan di tempat";
  }

  function setBackgroundInert(inert) {
    [dom.header, dom.main, dom.footer, dom.cartBar, dom.skipLink].forEach((element) => {
      if (!element) return;
      if (inert) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  }

  function lockScroll(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function isVisible(element) {
    return Boolean(
      element &&
      element.isConnected &&
      (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    );
  }

  function restoreFocus(element, fallback) {
    if (isVisible(element) && !element.closest("[inert]")) {
      element.focus({ preventScroll: true });
      return;
    }
    if (isVisible(fallback)) fallback.focus({ preventScroll: true });
  }

  function openSheet() {
    if (core.cartCount(state.cart) === 0) return;

    window.clearTimeout(state.sheetTimer);
    state.sheetOpen = true;
    state.sessionOrderId = null;
    state.lastSheetFocus = document.activeElement;

    renderSheetForm();
    renderSheetItems();
    setButtonLabel(dom.copyOrderBtn, "Salin pesanan");
    setButtonLabel(dom.sendWaBtn, "Kirim via WhatsApp");

    dom.sheetBackdrop.hidden = false;
    dom.orderSheet.hidden = false;
    dom.orderSheet.classList.toggle("is-desktop", desktopQuery.matches);
    void dom.orderSheet.offsetWidth;

    dom.sheetBackdrop.classList.add("is-visible");
    dom.orderSheet.classList.add("is-visible");
    dom.cartBarOpen.setAttribute("aria-expanded", "true");
    lockScroll(true);
    setBackgroundInert(true);

    window.requestAnimationFrame(() => {
      dom.sheetClose.focus({ preventScroll: true });
    });
  }

  function closeSheet() {
    if (!state.sheetOpen) return;
    state.sheetOpen = false;
    dom.cartBarOpen.setAttribute("aria-expanded", "false");
    dom.sheetBackdrop.classList.remove("is-visible");
    dom.orderSheet.classList.remove("is-visible");

    window.clearTimeout(state.sheetTimer);
    state.sheetTimer = window.setTimeout(() => {
      dom.sheetBackdrop.hidden = true;
      dom.orderSheet.hidden = true;
      lockScroll(false);
      setBackgroundInert(false);
      restoreFocus(state.lastSheetFocus, dom.menuSearch);
      state.sessionOrderId = null;
    }, motionOff ? 0 : 300);
  }

  function commitSheetChange(focus) {
    saveCart();
    updateCartBar({ animate: false });
    renderSheetItems(focus);
    if (core.cartCount(state.cart) === 0) {
      state.sessionOrderId = null;
      announce("Pesanan sekarang kosong.");
    }
  }

  function handleSheetAction(button) {
    const action = button.dataset.action;
    const name = button.dataset.name;
    const item = state.cart.find((entry) => entry.name === name);
    if (!item) return;

    if (action === "inc") {
      if (item.qty >= MAX_QTY) return;
      item.qty += 1;
      commitSheetChange({ action: "inc", name });
      announce(item.name + " sekarang " + item.qty + ".");
      return;
    }

    if (action === "dec") {
      if (item.qty <= 1) {
        state.cart = state.cart.filter((entry) => entry.name !== name);
        commitSheetChange({ action: "dec", name });
        announce(item.name + " dihapus dari pesanan.");
        return;
      }
      item.qty -= 1;
      commitSheetChange({ action: "dec", name });
      announce(item.name + " sekarang " + item.qty + ".");
      return;
    }

    if (action === "remove") {
      state.cart = state.cart.filter((entry) => entry.name !== name);
      commitSheetChange({ action: "remove", name });
      announce(item.name + " dihapus dari pesanan.");
    }
  }

  function ensureOrderId() {
    if (!state.sessionOrderId) {
      state.sessionOrderId = core.getOrderId(CAFE.idPrefix || "NC");
    }
    return state.sessionOrderId;
  }

  function buildMessage() {
    return core.buildOrderMessage({
      cafe: CAFE,
      cart: state.cart,
      meta: state.meta,
      id: ensureOrderId(),
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        /* Fall through to the legacy path. */
      }
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "-9999px";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    field.setSelectionRange(0, field.value.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    field.remove();
    return copied;
  }

  async function copyOrder() {
    if (core.cartCount(state.cart) === 0) return;
    const message = buildMessage();
    const copied = await copyText(message);
    if (copied) {
      flashButtonLabel(dom.copyOrderBtn, "Tersalin", "Salin pesanan");
      showToast("Pesanan disalin. Tempel di chat WhatsApp cafe.");
      announce("Pesanan disalin ke papan klip.");
    } else {
      showToast("Pesanan belum bisa disalin otomatis. Coba lagi.");
      announce("Pesanan belum bisa disalin.");
    }
  }

  function openExternal(url) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  async function sendViaWhatsApp() {
    if (core.cartCount(state.cart) === 0) return;
    const message = buildMessage();
    const link = whatsappHref(message);

    if (link) {
      openExternal(link);
      announce("Membuka WhatsApp dengan pesananmu.");
      return;
    }

    const copied = await copyText(message);
    if (copied) {
      flashButtonLabel(dom.sendWaBtn, "Pesanan disalin", "Kirim via WhatsApp");
      showToast(
        "Nomor WhatsApp cafe belum diisi (contoh desain). Pesanan sudah disalin — kirim manual ke cafe."
      );
      announce("Nomor WhatsApp belum tersedia. Pesanan sudah disalin.");
    } else {
      showToast(
        "Nomor WhatsApp cafe belum diisi (contoh desain). Gunakan tombol Salin pesanan."
      );
      announce("Nomor WhatsApp belum tersedia dan pesanan belum tersalin.");
    }
  }

  /* ---------- Lightbox ---------- */

  function buildLightboxImage() {
    const photo = photos[state.lightboxIndex];
    if (!photo) return;
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = String(photo.alt || "Suasana Nine Cafe");
    image.decoding = "async";
    dom.lightboxImg.replaceChildren(image);

    const alt = String(photo.alt || "Suasana Nine Cafe");
    dom.lightboxCaption.textContent =
      alt + " · " + (state.lightboxIndex + 1) + " dari " + photos.length;
    dom.lightboxPrev.hidden = photos.length < 2;
    dom.lightboxNext.hidden = photos.length < 2;
  }

  function openLightbox(index) {
    if (photos.length === 0) return;
    state.lightboxOpen = true;
    state.lightboxIndex = (index + photos.length) % photos.length;
    state.lastLightboxFocus = document.activeElement;

    buildLightboxImage();
    dom.lightbox.hidden = false;
    lockScroll(true);
    setBackgroundInert(true);
    dom.lightboxClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!state.lightboxOpen) return;
    state.lightboxOpen = false;
    dom.lightbox.hidden = true;
    lockScroll(false);
    setBackgroundInert(false);
    restoreFocus(state.lastLightboxFocus, dom.menuSearch);
  }

  function stepLightbox(offset) {
    if (photos.length === 0) return;
    state.lightboxIndex = (state.lightboxIndex + offset + photos.length) % photos.length;
    buildLightboxImage();
  }

  /* ---------- Focus + keyboard ---------- */

  function focusables(container) {
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((element) => isVisible(element));
  }

  function trapFocus(event, container) {
    if (event.key !== "Tab") return;
    const items = focusables(container);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !container.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event) {
    if (state.lightboxOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
        return;
      }
      trapFocus(event, dom.lightbox);
      return;
    }

    if (state.sheetOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      trapFocus(event, dom.orderSheet);
    }
  }

  /* ---------- Scroll reveal ---------- */

  function initReveal(scope) {
    const elements = $$(".reveal:not(.is-visible)", scope || document);
    if (motionOff || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
    );

    elements.forEach((element, index) => {
      if (element.closest("[hidden]")) return;
      const rect = element.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.94) {
        element.classList.add("is-visible");
        return;
      }
      element.style.setProperty("--i", String(index % 6));
      element.classList.add("will-reveal");
      observer.observe(element);
    });
  }

  /* ---------- Header / scroll spy ---------- */

  function updateHeader() {
    const y = window.scrollY || window.document.documentElement.scrollTop;
    dom.header.classList.toggle("is-scrolled", y > 8);

    if (y > 150 && y > state.lastScrollY + 5 && !dom.header.contains(document.activeElement)) {
      dom.header.classList.add("is-hidden");
    } else if (y < state.lastScrollY - 5 || y < 90) {
      dom.header.classList.remove("is-hidden");
    }
    state.lastScrollY = y;

    const marker = y + (dom.header.offsetHeight || 66) + 80;
    const sections = [dom.menuSection, dom.gallerySection, dom.visitSection];
    let current = null;
    sections.forEach((section) => {
      if (!section) return;
      const top = section.getBoundingClientRect().top + y;
      if (top <= marker) current = "#" + section.id;
    });

    if (state.currentSection !== current) {
      state.currentSection = current;
      dom.navLinks.forEach((link) => {
        if (link.getAttribute("href") === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }
  }

  function scheduleHeaderUpdate() {
    if (state.scrollQueued) return;
    state.scrollQueued = true;
    window.requestAnimationFrame(() => {
      state.scrollQueued = false;
      updateHeader();
    });
  }

  function initHeader() {
    window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
    window.addEventListener("resize", scheduleHeaderUpdate);
    window.addEventListener("hashchange", scheduleHeaderUpdate);
    updateHeader();
  }

  /* ---------- Demo / URL boot ---------- */

  function readInitialState() {
    const requestedCategory = params.get("kategori");
    if (requestedCategory) {
      const match = categories.find(
        (category) => category.toLowerCase() === requestedCategory.toLowerCase()
      );
      state.activeCategory = match || "Semua";
    }

    const requestedSearch = params.get("cari") || params.get("q") || "";
    state.query = requestedSearch.trim();
    dom.menuSearch.value = state.query;
  }

  function seedDemoCart() {
    if (params.get("demo") !== "cart" || allMenuItems.length === 0) return;
    const first = allMenuItems[0];
    const second = allMenuItems[1] || allMenuItems[0];
    state.cart = [
      { name: first.name, price: first.price, qty: 2, note: "" },
      { name: second.name, price: second.price, qty: 1, note: "" },
    ];
    state.meta = { name: "", type: "Makan di tempat", table: "", note: "" };
    saveCart();
    updateCartBar({ animate: false });
  }

  function maybeOpenDemoSheet() {
    if (params.get("sheet") !== "1" || core.cartCount(state.cart) === 0) return;
    window.setTimeout(openSheet, 220);
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    dom.pillBar.addEventListener("click", (event) => {
      const pill = event.target.closest(".pill");
      if (pill) setCategory(pill.dataset.cat);
    });

    dom.menuSearch.addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      renderMenu();
      updateUrlState(false);
    });

    dom.menuSearch.addEventListener("search", (event) => {
      if (event.target.value !== state.query) {
        state.query = event.target.value.trim();
        renderMenu();
        updateUrlState(false);
      }
    });

    dom.menuGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-order]");
      if (button) addToCart(button.dataset.order);
    });

    dom.cartBarOpen.addEventListener("click", openSheet);
    dom.cartClear.addEventListener("click", clearCart);
    dom.sheetClose.addEventListener("click", closeSheet);
    dom.sheetBackdrop.addEventListener("click", closeSheet);

    dom.sheetItems.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (button) handleSheetAction(button);
    });

    dom.sheetItems.addEventListener("input", (event) => {
      const field = event.target.closest('input[data-action="note"]');
      if (!field) return;
      const item = state.cart.find((entry) => entry.name === field.dataset.name);
      if (!item) return;
      item.note = field.value;
      saveCart();
    });

    dom.orderName.addEventListener("input", (event) => {
      state.meta.name = event.target.value;
      saveCart();
    });

    dom.orderType.addEventListener("change", (event) => {
      state.meta.type = event.target.value;
      dom.tableField.hidden = state.meta.type !== "Makan di tempat";
      saveCart();
    });

    dom.orderTable.addEventListener("input", (event) => {
      state.meta.table = event.target.value;
      saveCart();
    });

    dom.orderNote.addEventListener("input", (event) => {
      state.meta.note = event.target.value;
      saveCart();
    });

    dom.sendWaBtn.addEventListener("click", () => {
      void sendViaWhatsApp();
    });

    dom.copyOrderBtn.addEventListener("click", () => {
      void copyOrder();
    });

    dom.waHeroBtn.addEventListener("click", () => {
      if (hasWhatsApp) return;
      showToast(
        "Nomor WhatsApp cafe belum diisi (contoh desain). Pilih menu, lalu salin pesanan dari keranjang."
      );
    });

    dom.waBigBtn.addEventListener("click", () => {
      if (hasWhatsApp) return;
      showToast(
        "Nomor WhatsApp cafe belum diisi (contoh desain). Pilih menu, lalu salin pesanan dari keranjang."
      );
    });

    dom.galleryGrid.addEventListener("click", (event) => {
      const item = event.target.closest(".gallery-item[data-index]");
      if (item) openLightbox(Number(item.dataset.index));
    });

    dom.lightboxClose.addEventListener("click", closeLightbox);
    dom.lightboxPrev.addEventListener("click", () => stepLightbox(-1));
    dom.lightboxNext.addEventListener("click", () => stepLightbox(1));
    dom.lightbox.addEventListener("click", (event) => {
      if (event.target === dom.lightbox) closeLightbox();
    });

    document.addEventListener("keydown", onKeydown);

    desktopQuery.addEventListener("change", () => {
      if (state.sheetOpen) {
        dom.orderSheet.classList.toggle("is-desktop", desktopQuery.matches);
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) renderStatus();
    });

    dom.orderName.addEventListener("blur", () => {
      state.meta.name = dom.orderName.value.trim();
      saveCart();
    });
  }

  /* ---------- Init ---------- */

  function init() {
    if (params.get("motion") === "off") {
      document.documentElement.classList.add("motion-off");
    }

    readInitialState();
    loadCart();

    renderTicker();
    renderBento();
    renderPills();
    renderMenu();
    renderGallery();
    renderHours();
    renderLocation();
    fillFooter();
    renderWaEntryPoints();
    renderStatus();
    updateCartBar({ animate: false });
    bindEvents();
    seedDemoCart();
    initReveal(dom.bentoGrid);
    initReveal(dom.galleryGrid);
    initHeader();

    window.setInterval(renderStatus, 60000);
    window.addEventListener("load", scheduleHeaderUpdate, { once: true });
    maybeOpenDemoSheet();
  }

  init();
})();
