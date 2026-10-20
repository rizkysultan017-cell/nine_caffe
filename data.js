/* ============================================================
   NINE CAFE & EATERY — data.js
   Satu-satunya sumber data untuk seluruh situs.
   Ganti nilai di bawah, seluruh halaman mengikuti otomatis.
   demo: true = DATA CONTOH, belum diterima dari cafe.
   ============================================================ */

const CAFE = {
  name: "Nine Cafe & Eatery",
  tagline: "Kopi dan santapan hangat di Dau, Malang",
  waNumber: "628XXXXXXXXXX", // DRAF: nomor developer. Ganti ke nomor cafe setelah disetujui.
  instagram: "", // ISI setelah diketahui
  address: "Dau, Kabupaten Malang, Jawa Timur",
  timezone: "Asia/Jakarta",
  idPrefix: "NC",
  sample: true, // true = tampilkan penanda "Contoh desain"
  hours: {
    // 0 = Minggu ... 6 = Sabtu, [buka, tutup] jam 24, tutup > 24 = lewat tengah malam
    0: [13, 24], 1: [13, 24], 2: [13, 24], 3: [13, 24], 4: [13, 24], 5: [13, 24], 6: [13, 24],
  },
  theme: {
    // Keep in sync with the CSS custom properties in style.css.
    paper: "#F2EBDD",
    paperDeep: "#E7DCC8",
    paperLight: "#FFFBF3",
    ink: "#17211B",
    forest: "#203026",
    sage: "#4B6352",
    clay: "#9C4A2E",
    butter: "#E4C36A",
    muted: "#5D665E",
  },
  highlights: [
    { title: "Suasana", text: "Tempat nongkrong hangat dengan sentuhan kayu dan lampu hangat, cocok untuk bersantai bersama teman atau keluarga." },
    { title: "Menu", text: "Coffee Based, Milk Based, Refresher, Main Course, dan Snack Based. Nama dan harga mengikuti daftar menu cafe." },
    { title: "Buka sampai Tengah Malam", text: "Setiap hari pukul 13.00 hingga 00.00 WIB. Tempat pas untuk malam-malam panjang di Dau." },
    { title: "Fasilitas", text: "WiFi gratis, parkir luas, mushola, tersedia area indoor dan outdoor." },
    { title: "Cara Pesan", text: "Pilih menu, tambah ke keranjang, kirim via WhatsApp. Tanpa antre, tanpa aplikasi tambahan." },
  ],
  facilities: ["WiFi gratis", "Parkir luas", "Mushola", "Indoor & Outdoor", "AC"],
  gallery: [], // kosong = placeholder bergaya
  categories: ["Coffee Based", "Milk Based", "Refresher", "Main Course", "Snack Based"],
  menu: {
    "Coffee Based": [
      { name: "Aren Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Caramel Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Butterscooth Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Vanilla Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Coffee Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Americano", desc: "", price: 15000, tag: "", photo: "", demo: false },
    ],
    "Milk Based": [
      { name: "Choco Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Matcha Latte", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Cha Thai", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Milky Oreo", desc: "", price: 18000, tag: "", photo: "", demo: false },
      { name: "Milky Berry", desc: "Strawberry atau blueberry", price: 18000, tag: "", photo: "", demo: false },
    ],
    "Refresher": [
      { name: "Lychee Tea", desc: "", price: 15000, tag: "", photo: "", demo: false },
      { name: "Lemon Breeze", desc: "", price: 15000, tag: "", photo: "", demo: false },
      { name: "Jasmine Tea", desc: "", price: 15000, tag: "", photo: "", demo: false },
    ],
    "Main Course": [
      { name: "Nasi Goreng Special", desc: "", price: 20000, tag: "", photo: "", demo: false },
      { name: "Spicy Pop", desc: "", price: 20000, tag: "", photo: "", demo: false },
      { name: "Cheezy Pop", desc: "", price: 20000, tag: "", photo: "", demo: false },
      { name: "Indomie", desc: "Goreng, kuah, atau nyemek", price: 15000, tag: "", photo: "", demo: false },
    ],
    "Snack Based": [
      { name: "Mix Platter", desc: "", price: 20000, tag: "", photo: "", demo: false },
      { name: "Frenchy Fries", desc: "", price: 16000, tag: "", photo: "", demo: false },
      { name: "Cireng", desc: "", price: 15000, tag: "", photo: "", demo: false },
      { name: "Bakwan Sayur", desc: "", price: 10000, tag: "", photo: "", demo: false },
      { name: "Mix Donuts", desc: "", price: 15000, tag: "", photo: "", demo: false },
      { name: "Cho-Cheese Banana", desc: "", price: 15000, tag: "", photo: "", demo: false },
      { name: "Signature Banana", desc: "", price: 15000, tag: "", photo: "", demo: false },
    ],
  },
};

if (typeof module !== "undefined") module.exports = CAFE;
