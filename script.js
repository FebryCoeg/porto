// Ikon SVG (path tunggal, viewBox 0 0 24 24) + warna brand
const ICONS = {
  instagram: { c: "#e1306c", p: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" },
  tiktok: { c: "#111111", p: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" },
  youtube: { c: "#ff0000", p: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" },
  twitter: { c: "#000000", p: "M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4zm-1.2 17.9h1.9L7 4.2H5l12 16z" },
  facebook: { c: "#1877f2", p: "M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" },
  discord: { c: "#5865f2", p: "M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.5 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.2-.9-9.7-3.6-13.7zM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" },
  twitch: { c: "#9146ff", p: "M2.1 0 .5 4.2v17h5.7V24h3.2l3-2.8h4.6l6.2-6.2V0H2.1zm19 13.9-3.5 3.5h-5.7l-3 3v-3H4.1V2.1h17v11.8zM17.6 6.4v6.1h-2.1V6.4h2.1zm-5.7 0v6.1H9.8V6.4h2.1z" },
  github: { c: "#24292f", p: "M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" },
  linkedin: { c: "#0a66c2", p: "M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zm1.8 13.1H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" },
  whatsapp: { c: "#25d366", p: "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.3-.3-.4-.6-.5zM12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 24 12a11.7 11.7 0 0 0-3.5-8.5z" },
  telegram: { c: "#229ed9", p: "M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.9 8.2-2 9.4c-.1.7-.5.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.4-.1l-6.9 4.3-3-.9c-.6-.2-.7-.6.1-1l11.6-4.5c.6-.2 1.1.1.9.9z" },
  spotify: { c: "#1db954", p: "M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.7.7 0 0 1-1 .3c-2.8-1.7-6.4-2.1-10.6-1.2a.7.7 0 1 1-.3-1.5c4.6-1 8.5-.6 11.6 1.4.4.2.5.6.3 1zm1.5-3.3a.9.9 0 0 1-1.3.3c-3.2-2-8.2-2.6-12-1.4a.9.9 0 1 1-.5-1.8c4.4-1.3 9.8-.7 13.5 1.6.4.3.6.8.3 1.3zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2a1.1 1.1 0 1 1-.6-2.1c4.3-1.3 11.3-1 15.7 1.6a1.1 1.1 0 0 1-1.2 1.9z" },
  email: { c: "#7c3aed", p: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" },
  website: { c: "#0ea5e9", p: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4a14 14 0 0 1 1.9 4h-3.8A14 14 0 0 1 12 4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8zM12 20a14 14 0 0 1-1.9-4h3.8A14 14 0 0 1 12 20zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4z" },
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const svg = (key) => {
  const i = ICONS[key] || ICONS.website;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${i.p}"/></svg>`;
};
const color = (key) => (ICONS[key] || ICONS.website).c;

// Logo platform donasi: pakai gambar "logo" dari data; kalau kosong, huruf depan nama di lingkaran berwarna.
const donasiColor = (d) => (/^#[0-9a-f]{3,8}$/i.test(d.warna || "") ? d.warna : "var(--accent)");
// Ikon platform donasi, digambar ulang mengikuti gaya ikon website (garis putih di kotak gradasi).
const DONATE_ICONS = {
  // dua pita melengkung yang membentuk huruf S
  sociabuzz: `<path class="thick" d="M17.2 6.4C15.8 4.6 13.1 3.7 10.6 4.4 7.5 5.3 6.9 8.8 9.4 10.6l1.9 1.2"/><path class="thick soft" d="M6.8 17.6c1.4 1.8 4.1 2.7 6.6 2 3.1-.9 3.7-4.4 1.2-6.2l-1.9-1.2"/>`,
  // toples dengan hati dan dua gelembung di atasnya
  trakteer: `<path d="M7 11h10v7.3a2.2 2.2 0 0 1-2.2 2.2H9.2A2.2 2.2 0 0 1 7 18.3z"/><path d="M8.6 11V9.2h6.8V11"/><circle cx="10.6" cy="5.9" r="1.6"/><circle cx="14.2" cy="4.9" r="2"/><path class="f" d="M12 18.3s-2.7-1.6-2.7-3.4a1.45 1.45 0 0 1 2.7-.75 1.45 1.45 0 0 1 2.7.75c0 1.8-2.7 3.4-2.7 3.4z"/>`,
  // wajah maskot bertelinga panjang
  saweria: `<path d="M6.2 13.2c0-3.5 2.6-5.9 5.8-5.9s5.8 2.4 5.8 5.9-2.4 6.6-5.8 6.6-5.8-3.1-5.8-6.6z"/><path d="M8.3 8.6C7 6.9 6.6 4.6 7.6 3.6c1-.9 2.7.6 3.3 3.8M15.7 8.6c1.3-1.7 1.7-4 .7-5-1-.9-2.7.6-3.3 3.8"/><circle class="f" cx="9.9" cy="12.9" r="1.05"/><circle class="f" cx="14.1" cy="12.9" r="1.05"/><path class="f" d="M11.1 15h1.8l-.9 1z"/><path d="M10.6 17c.8.6 2 .6 2.8 0"/>`,
  hati: `<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>`,
  cangkir: `<path d="M4.5 9.5h11.5v3.5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.6a2.3 2.3 0 0 1 0 4.6H16M3.5 21h14"/><path d="M8.5 3.2c-.9 1.1.9 1.9 0 3.3M12 3.2c-.9 1.1.9 1.9 0 3.3"/>`,
  hadiah: `<rect x="3.5" y="9" width="17" height="11" rx="1.8"/><path d="M2.5 9h19v-2.2a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8zM12 6v14"/><path d="M12 6c-1.5-2.8-5-3.2-5-1.2C7 6 9.5 6 12 6zm0 0c1.5-2.8 5-3.2 5-1.2C17 6 14.5 6 12 6z"/>`,
};

const donasiBadge = (d) => DONATE_ICONS[d.ikon]
  ? `<span class="don-icon don-icon--${esc(d.ikon)}"><svg viewBox="0 0 24 24" aria-hidden="true">${DONATE_ICONS[d.ikon]}</svg></span>`
  : d.logo
  ? `<img src="${esc(String(d.logo).replace(/^\/+(?:portfolio\/)?/, ""))}" alt="" loading="lazy">`
  : `<span class="don-initial">${esc((d.nama || "?").trim().charAt(0).toUpperCase())}</span>`;

function render(c) {
  document.title = `${c.nama} | Portfolio`;
  $("brand").textContent = c.nama.split(" ")[0];
  if (c.logo) {
    $("brand").innerHTML = `<img class="brand-logo" src="${esc(c.logo)}" alt="${esc(c.nama)}">`;
    $("footerLogo").src = c.logo; $("footerLogo").alt = c.nama; $("footerLogo").hidden = false;
    animateLogo($("brand").querySelector("img"), "-1.2s");
    animateLogo($("footerLogo"), "-2.4s");
  }
  $("footerName").textContent = c.nama;
  $("year").textContent = new Date().getFullYear();

  // tentang & biodata
  $("tentangText").textContent = c.tentang;
  $("biodata").innerHTML = `<dl style="display:grid;gap:12px">${(c.biodata || [])
    .map((b) => `<div class="bio-row"><dt>${esc(b.label)}</dt><dd>${esc(b.value)}</dd></div>`)
    .join("")}</dl>`;

  // sosmed
  const links = c.sosmed || [];
  $("socialGrid").innerHTML = links
    .map(
      (s) => `<a class="social-card" href="${esc(s.url)}" target="_blank" rel="noopener" style="--c:${color(s.platform)}">
        <span class="social-icon">${svg(s.platform)}</span>
        <span><strong>${esc(s.label)}</strong><small>${esc(s.handle)}</small></span>
        <span class="arrow">→</span></a>`
    )
    .join("");

  // pencapaian
  $("timeline").innerHTML = (c.pencapaian || [])
    .map((p) => {
      const img = p.gambar ? String(p.gambar).replace(/^\/+(?!\/)(?:portfolio\/)?/, "") : "";
      return `<li class="card${img ? " has-img" : ""}">
        ${img ? `<div class="tl-img"><img src="${esc(img)}" alt="" loading="lazy">${p.kredit ? `<small class="tl-credit">${esc(p.kredit)}</small>` : ""}</div>` : ""}
        <div class="tl-body"><span class="year">${esc(p.tahun)}</span><h3>${esc(p.judul)}</h3><p>${esc(p.deskripsi)}</p></div>
      </li>`;
    })
    .join("");

  // donasi
  if (c.donasiJudul) $("donasiJudul").textContent = c.donasiJudul;
  $("donasiPesan").textContent = c.donasiPesan;
  const shortUrl = (u) => { try { const x = new URL(u); return (x.host + x.pathname).replace(/^www\./, "").replace(/\/$/, ""); } catch { return u; } };
  const hex = (v) => (/^#[0-9a-f]{3,8}$/i.test(v || "") ? v : "var(--accent)");
  $("donateButtons").innerHTML = (c.donasi || [])
    .map((d) => `<a class="donate-btn" href="${esc(d.url)}" target="_blank" rel="noopener" style="--c:${hex(d.warna)}">
        <span class="donate-logo">${donasiBadge(d)}</span>
        <span class="donate-txt"><strong>${esc(d.nama)}</strong><small>${esc(shortUrl(d.url))}</small></span>
        <span class="donate-arrow">↗</span></a>`)
    .join("");
  if (c.qris) { $("qrisImg").src = c.qris; $("qrisWrap").hidden = false; }

  // toko top up
  renderToko(c.toko);

  // game yang dimainkan
  renderGame(c.game);

  // dasbor youtube
  renderYoutube(c.youtube, c.youtubeData);

  // kontak

}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function renderToko(t) {
  const sec = $("toko");
  if (!t || t.aktif === false || !t.url) { sec.hidden = true; return; }
  sec.hidden = false;
  const icon = (k) => (window.CARD_ICONS && CARD_ICONS[k]) || "";
  const logo = t.ikon && icon(t.ikon)
    ? `<span class="toko-icon">${icon(t.ikon)}</span>`
    : t.logo
    ? `<img src="${esc(String(t.logo).replace(/^\/+(?!\/)(?:portfolio\/)?/, ""))}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'toko-initial',textContent:'${esc((t.nama || "T").charAt(0))}'}))">`
    : `<span class="toko-initial">${esc((t.nama || "T").charAt(0))}</span>`;
  $("tokoCard").innerHTML = `
    <div class="toko-main">
      <div class="toko-head">
        <span class="toko-logo">${logo}</span>
        <div>
          <h3>${esc(t.nama)}</h3>
          <p class="toko-tagline">${esc(t.tagline || "")}</p>
        </div>
      </div>
      <p class="toko-desc">${esc(t.deskripsi || "")}</p>
      <div class="toko-stats">${(t.statistik || []).map((s) => `<div><strong>${esc(s.angka)}</strong><small>${esc(s.label)}</small></div>`).join("")}</div>
      <div class="toko-games">${(t.game || []).map((g) => `<span>${esc(g)}</span>`).join("")}</div>
      <a class="btn btn-primary toko-cta" href="${esc(t.url)}" target="_blank" rel="noopener">${icon("toko")}${esc(t.tombol || "Visit Store")} <span aria-hidden="true">↗</span></a>
    </div>
    <ul class="toko-perks">${(t.keunggulan || []).map((k) => `
      <li><span class="toko-perk-icon">${icon(k.ikon)}</span><div><strong>${esc(k.judul)}</strong><small>${esc(k.deskripsi || "")}</small></div></li>`).join("")}
    </ul>`;
}

// Game yang dimainkan: panel-panel yang melebar saat disorot (klik/tap di HP)
function renderGame(g) {
  const sec = $("game");
  const list = (g && g.aktif !== false && Array.isArray(g.daftar) ? g.daftar : []).filter((x) => x && x.nama);
  if (!list.length) { sec.hidden = true; return; }
  sec.hidden = false;
  if (g.judul) $("gameJudul").textContent = g.judul;
  if (g.petunjuk !== undefined) { $("gameHint").textContent = g.petunjuk; $("gameHint").hidden = !g.petunjuk; }
  const acc = $("gameAcc");
  acc.innerHTML = list.map((x, i) => {
    const warna = /^#[0-9a-f]{3,8}$/i.test(x.warna || "") ? `--g:${x.warna};` : "";
    const img = x.gambar ? String(x.gambar).replace(/^\/+(?!\/)(?:portfolio\/)?/, "") : "";
    const stats = (x.data || []).filter((d) => d && d.label && d.nilai);
    return `
    <article class="game-panel${i === 0 ? " active" : ""}" tabindex="0" style="${warna}" aria-label="${esc(x.nama)}">
      <div class="gp-bg">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}</div>
      <span class="gp-word" aria-hidden="true">${esc(x.singkat || x.nama)}</span>
      <div class="gp-tab" aria-hidden="true"><span class="gp-num">${String(i + 1).padStart(2, "0")}</span><span class="gp-name">${esc(x.nama)}</span><span class="gp-plus">+</span></div>
      <div class="gp-info">
        ${x.genre ? `<span class="gp-genre">${esc(x.genre)}</span>` : ""}
        <h3>${esc(x.nama)}</h3>
        ${x.deskripsi ? `<p>${esc(x.deskripsi)}</p>` : ""}
        ${x.uid && String(x.uid).trim() !== "-" ? `<button type="button" class="gp-uid" data-uid="${esc(x.uid)}" aria-label="Copy UID ${esc(x.uid)}"><small>UID</small><strong>${esc(x.uid)}</strong><span>Copy</span></button>` : ""}
        ${stats.length ? `<dl class="gp-stats">${stats.map((d) => `<div><dt>${esc(d.label)}</dt><dd>${esc(d.nilai)}</dd></div>`).join("")}</dl>` : ""}
      </div>
      <span class="gp-count" aria-hidden="true">${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</span>
      ${x.kredit ? `<small class="gp-credit">${esc(x.kredit)}</small>` : ""}
    </article>`;
  }).join("");

  const panels = [...acc.querySelectorAll(".game-panel")];
  const open = (p) => panels.forEach((q) => q.classList.toggle("active", q === p));
  const canHover = matchMedia("(hover: hover)");
  panels.forEach((p) => {
    p.addEventListener("mouseenter", () => canHover.matches && open(p));
    p.addEventListener("focus", () => open(p));
    p.addEventListener("click", () => open(p));
    p.addEventListener("keydown", (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!k || e.target !== p) return;
      e.preventDefault();
      panels[(panels.indexOf(p) + k + panels.length) % panels.length].focus();
    });
  });
  acc.addEventListener("click", (e) => {
    const b = e.target.closest(".gp-uid");
    if (!b || !b.closest(".game-panel.active")) return;
    const uid = b.dataset.uid;
    const done = () => { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1600); toast("UID copied: " + uid); };
    if (navigator.clipboard) navigator.clipboard.writeText(uid).then(done, () => toast("UID: " + uid));
    else toast("UID: " + uid);
  });
}

// "3 days ago" dari tanggal ISO
function waktuLalu(iso) {
  const t = Date.parse(iso);
  if (!t) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  const u = [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [n, nama] of u) if (s >= n) { const k = Math.floor(s / n); return `${k} ${nama}${k > 1 ? "s" : ""} ago`; }
  return "just now";
}

// Dasbor YouTube: info channel + video terbaru berjajar, diputar di jendela pop-up
function renderYoutube(cfg, yt) {
  const sec = $("youtube");
  const list = (yt && Array.isArray(yt.video) ? yt.video : []).filter((v) => /^[\w-]{11}$/.test(v.id || ""));
  if ((cfg && cfg.aktif === false) || !list.length) { sec.hidden = true; return; }
  sec.hidden = false;
  if (cfg && cfg.judul) $("ytJudul").textContent = cfg.judul;
  const ch = yt.channel || {};
  const url = ch.url || "https://www.youtube.com/";
  const ytIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS.youtube.p}"/></svg>`;
  const stat = (angka, label) => (angka ? `<div class="yt-stat"><strong>${esc(angka)}</strong><small>${label}</small></div>` : "");

  $("ytDash").innerHTML = `
    <div class="yt-head">
      ${ch.banner ? `<img class="yt-banner" src="${esc(ch.banner)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
      <div class="yt-channel">
        <a class="yt-avatar" href="${esc(url)}" target="_blank" rel="noopener">${ch.avatar ? `<img src="${esc(ch.avatar)}" alt="${esc(ch.nama || "Channel")}" referrerpolicy="no-referrer">` : ytIcon}</a>
        <div class="yt-name">
          <h3>${esc(ch.nama || "YouTube")}</h3>
          <a href="${esc(url)}" target="_blank" rel="noopener">${esc(ch.handle || "")}</a>
        </div>
        <div class="yt-stats">
          ${stat(ch.subscriber, "Subscribers")}
          ${stat(ch.video, "Videos")}
          ${stat(waktuLalu(list[0].tanggal), "Last upload")}
        </div>
        <a class="btn yt-sub" href="${esc(url)}?sub_confirmation=1" target="_blank" rel="noopener">${ytIcon}Subscribe</a>
      </div>
    </div>
    <div class="yt-bar">
      <span class="yt-bar-title"><i class="yt-live"></i>Latest uploads</span>
      <div class="yt-nav">
        <button type="button" class="yt-arrow" data-dir="-1" aria-label="Previous videos">‹</button>
        <button type="button" class="yt-arrow" data-dir="1" aria-label="Next videos">›</button>
      </div>
    </div>
    <div class="yt-row" id="ytRow">${list.map((v, i) => `
      <a class="yt-video" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener" data-id="${v.id}" data-judul="${esc(v.judul)}">
        <span class="yt-thumb">
          <img src="https://i.ytimg.com/vi/${v.id}/hq720.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg'">
          ${i === 0 ? `<b class="yt-new">NEW</b>` : ""}
          ${v.durasi ? `<b class="yt-dur">${esc(String(v.durasi).replace(".", ":"))}</b>` : ""}
          <span class="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
        </span>
        <span class="yt-title">${esc(v.judul)}</span>
        <span class="yt-meta">${v.ditonton ? `${esc(v.ditonton)} views · ` : ""}${waktuLalu(v.tanggal)}</span>
      </a>`).join("")}
    </div>`;

  const row = $("ytRow");
  const arrows = [...$("ytDash").querySelectorAll(".yt-arrow")];
  const syncArrows = () => {
    arrows[0].disabled = row.scrollLeft < 8;
    arrows[1].disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8;
  };
  arrows.forEach((b) => (b.onclick = () => row.scrollBy({ left: +b.dataset.dir * row.clientWidth * 0.85, behavior: "smooth" })));
  row.addEventListener("scroll", syncArrows, { passive: true });
  addEventListener("resize", syncArrows);
  syncArrows();

  // pemutar pop-up
  let modal = $("ytModal");
  if (!modal) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="yt-modal" id="ytModal" hidden role="dialog" aria-modal="true" aria-label="Video player">
        <div class="yt-modal-box">
          <div class="yt-frame"></div>
          <div class="yt-modal-foot">
            <strong class="yt-modal-title"></strong>
            <a class="yt-modal-open" target="_blank" rel="noopener">Open on YouTube ↗</a>
            <button type="button" class="yt-close" aria-label="Close">✕</button>
          </div>
        </div>
      </div>`);
    modal = $("ytModal");
    const close = () => { modal.hidden = true; modal.querySelector(".yt-frame").innerHTML = ""; document.body.classList.remove("yt-lock"); };
    modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".yt-close")) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  }
  row.addEventListener("click", (e) => {
    const a = e.target.closest(".yt-video");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const id = a.dataset.id;
    modal.querySelector(".yt-frame").innerHTML =
      `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(a.dataset.judul)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    modal.querySelector(".yt-modal-title").textContent = a.dataset.judul;
    modal.querySelector(".yt-modal-open").href = a.href;
    modal.hidden = false;
    document.body.classList.add("yt-lock");
    modal.querySelector(".yt-close").focus();
  });
}

function setupInteractions(c) {
  // Form kontak: membuka email pengunjung dengan pesan yang sudah terisi
  $("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pesan = $("cfPesan").value.trim();
    if (!pesan) { $("cfPesan").focus(); toast("Please write your message first"); return; }
    const nama = $("cfNama").value.trim();
    const panggilan = (c.nama || "").split(" ")[0];
    const subjek = $("cfSubjek").value.trim() || `Hi ${panggilan}!` + (nama ? ` (from ${nama})` : "");
    const isi = pesan + (nama ? `\n\n${nama}` : "");
    const via = (e.submitter && e.submitter.dataset.via) || "gmail";
    const q = (o) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    if (via === "app") {
      location.href = `mailto:${c.email}?${q({ subject: subjek, body: isi })}`;
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&${q({ to: c.email, su: subjek, body: isi })}`, "_blank", "noopener");
    }
  });

  document.querySelectorAll(".theme-toggle").forEach((btn) => (btn.onclick = () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  }));

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), io.unobserve(e.target))),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

window.initSite = function (c) {
  render(c);
  setupInteractions(c);
};

// Navigasi bersih: klik menu/tombol "#bagian" tetap meluncur ke bagiannya,
// tapi alamat di browser tidak berubah (tanpa #tentang, #pencapaian, dll.)
(function () {
  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  const go = (id) => {
    if (!id || id === "top") return window.scrollTo({ top: 0, behavior: smooth() });
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: smooth(), block: "start" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    if (id && id !== "top" && !document.getElementById(id)) return;
    e.preventDefault();
    go(id);
  });
  // kalau ada yang membuka link lama berisi #bagian: tetap menuju bagiannya, lalu bersihkan alamatnya
  const clean = (delay) => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => go(id), delay);
  };
  if (location.hash) addEventListener("load", () => clean(300));
  addEventListener("hashchange", () => clean(0));
})();
