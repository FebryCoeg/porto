// ============================================================
//  Landing page: isi teks + maskot yang mengikuti kursor
// ============================================================
window.initHero = function (CONFIG) {
  const c = CONFIG;
  const h = c.hero || {};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Teks ----------
  const initials = c.nama.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  $("hbAvatar").innerHTML = c.foto ? `<img src="${esc(c.foto)}" alt="Photo of ${esc(c.nama)}">` : esc(initials);
  $("hbName").textContent = c.nama;
  if (c.logo) $("hbName").closest(".hb-logo").innerHTML = `<img class="hb-logo-img" src="${esc(c.logo)}" alt="${esc(c.nama)}">`;
  if (c.logo) animateLogo(document.querySelector(".hb-logo-img"));
  $("heroLabel").textContent = h.label || "";
  const words = h.judul || [];
  $("heroTitle").innerHTML = words
    .map((w, i) => `<span class="${i === words.length - 1 ? "accent" : ""}" style="--i:${i}">${esc(w)}</span>`)
    .join("");
  $("heroDesc").textContent = h.deskripsi || c.tentang;
  if (h.tombolUtama) { $("ctaMain").innerHTML = `${esc(h.tombolUtama.teks)} <span>→</span>`; $("ctaMain").href = h.tombolUtama.link; }
  if (h.tombolKedua) { $("ctaSecondText").textContent = h.tombolKedua.teks; $("ctaSecond").href = h.tombolKedua.link; }

  // tumpukan logo platform donasi (kanan atas)
  const don = (c.donasi || []).slice(0, 5);
  const icons = don
    .map((d) => `<a class="stat-don" href="${esc(d.url)}" target="_blank" rel="noopener" title="${esc(d.nama)}" aria-label="Donate via ${esc(d.nama)}" style="--c:${donasiColor(d)}">${donasiBadge(d)}</a>`)
    .join("");
  $("statStack").innerHTML = icons + (h.statAngka ? `<span class="stat-num">${esc(h.statAngka)}</span>` : "");
  $("statJudul").textContent = h.statJudul || "Support me here";
  $("statSub").textContent = h.statSub || don.map((d) => d.nama).join(" · ");
  $("statJudul").closest(".hero-stat").hidden = don.length === 0;

  $("heroCards").innerHTML = (h.kartu || [])
    .map((k) => `<a class="hero-card" href="${esc(k.link)}">
        ${CARD_ICONS[k.ikon] ? `<span class="hc-icon">${CARD_ICONS[k.ikon]}</span>` : `<span class="hc-emoji">${esc(k.emoji)}</span>`}
        <strong>${esc(k.judul)}</strong>
        <small>${esc(k.deskripsi)}</small>
        <span class="hc-go">GO</span>
      </a>`)
    .join("");

  // ---------- Karakter ----------
  const stage = $("heroStage");
  const heroEl = $("top");
  let scene = null;
  if (h.latar && h.latar.gambar && window.createImageHero) {
    heroEl.classList.add("hero--image");
    stage.remove();
    scene = createImageHero($("heroScene"), h.latar);
    if (h.latar.kredit) $("heroCredit").textContent = h.latar.kredit;
    makePetals($("heroPetals"), reduceMotion ? 0 : innerWidth < 860 ? 10 : 18);
  } else if (h.gambar) {
    heroEl.classList.remove("hero--image");
    stage.innerHTML = `<img class="hero-img" id="heroImg" src="${esc(h.gambar)}" alt="${esc(c.nama)}">`;
  } else {
    heroEl.classList.remove("hero--image");
    stage.innerHTML = MASCOT_SVG;
  }

  const head = $("mHead"), body = $("mBody"), pupils = [$("mPupilL"), $("mPupilR")], eyes = $("mEyes"), img = $("heroImg");
  const hero = $("top"), glow = $("heroGlow"), ring = $("cursorRing");

  let tx = 0, ty = 0;     // target (-1..1)
  let x = 0, y = 0;       // posisi halus
  let lastMove = -1e9, mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, inside = false;

  hero.addEventListener("pointermove", (e) => {
    const imageMode = !stage.isConnected;
    const r = (imageMode ? hero : stage).getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * (imageMode ? 0.38 : 0.4);
    tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (innerWidth / 2)));
    ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (innerHeight / 2)));
    lastMove = performance.now();
    const hr = hero.getBoundingClientRect();
    mouseX = e.clientX - hr.left; mouseY = e.clientY - hr.top;
    inside = true;
  });
  hero.addEventListener("pointerleave", () => { inside = false; });

  // kedip
  function blink() {
    if (eyes) {
      eyes.classList.add("blink");
      setTimeout(() => eyes.classList.remove("blink"), 140);
    }
    setTimeout(blink, 2500 + Math.random() * 3500);
  }
  if (!reduceMotion) setTimeout(blink, 2000);

  function frame(t) {
    // diam > 2,5 detik → melirik sendiri
    if (!reduceMotion && t - lastMove > 2500) {
      const s = t / 1000;
      tx = Math.sin(s * 0.7) * 0.75 + Math.sin(s * 1.9) * 0.15;
      ty = Math.cos(s * 0.5) * 0.25 - 0.05;
    }
    const k = reduceMotion ? 1 : 0.08;
    x += (tx - x) * k;
    y += (ty - y) * k;

    if (head) {
      head.setAttribute("transform", `translate(${(x * 26).toFixed(2)} ${(y * 14).toFixed(2)}) rotate(${(x * 9 + y * x * 3).toFixed(2)} 200 330)`);
      body.setAttribute("transform", `translate(${(x * 6).toFixed(2)} 0)`);
      pupils.forEach((p) => p.setAttribute("transform", `translate(${(x * 10).toFixed(2)} ${(y * 7).toFixed(2)})`));
    }
    const sc = window.__heroFallback || scene;
    if (sc) sc.draw(x, y, t);
    if (img) img.style.transform = `perspective(900px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateX(${(x * 10).toFixed(2)}px)`;

    // cahaya & cincin kursor
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (glow) glow.style.transform = `translate(${(x * 60).toFixed(1)}px, ${(y * 40).toFixed(1)}px)`;
    if (ring) {
      ring.style.transform = `translate(${ringX - 22}px, ${ringY - 22}px)`;
      ring.style.opacity = inside ? 1 : 0;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // nav atas muncul setelah melewati landing page
  const nav = $("stickyNav");
  new IntersectionObserver(([e]) => nav.classList.toggle("show", !e.isIntersecting), { threshold: 0.08 }).observe(hero);
};

// Ikon kartu landing page (digambar sendiri, gaya garis 24×24).
// Nama ikon dipakai di data.json → hero.kartu[].ikon
var CARD_ICONS = (function () {
  const line = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  return {
    sosmed: line(`<path d="M4 6.5A3 3 0 0 1 7 3.5h10a3 3 0 0 1 3 3V13a3 3 0 0 1-3 3h-5.5L7 19.5V16a3 3 0 0 1-3-3z"/><path class="f" d="M12 13s-3.2-1.9-3.2-4.1a1.7 1.7 0 0 1 3.2-.8 1.7 1.7 0 0 1 3.2.8C15.2 11.1 12 13 12 13z"/>`),
    trofi: line(`<path d="M8 3.5h8V9a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.2a2.6 2.6 0 0 0 3 3.9M16 5.5h2.8a2.6 2.6 0 0 1-3 3.9"/><path d="M12 13v3.5M8.5 20.5h7M9.5 16.5h5l.5 4h-6z"/><path class="f" d="M12 5.6l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2z"/>`),
    cangkir: line(`<path d="M4.5 9.5h11.5v3.5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.6a2.3 2.3 0 0 1 0 4.6H16M3.5 21h14"/><path d="M8.5 3.2c-.9 1.1.9 1.9 0 3.3M12 3.2c-.9 1.1.9 1.9 0 3.3"/><path class="f" d="M10.2 15.4s-2.2-1.3-2.2-2.8a1.15 1.15 0 0 1 2.2-.55 1.15 1.15 0 0 1 2.2.55c0 1.5-2.2 2.8-2.2 2.8z"/>`),
    hati: line(`<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/><path d="M8 10.2a2 2 0 0 1 1.6-1.9"/>`),
    bintang: line(`<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>`),
    game: line(`<path d="M7.2 7.5h9.6a4.2 4.2 0 0 1 4.2 4.6l-.5 4.2a2.4 2.4 0 0 1-4.2 1.2L15 16H9l-1.3 1.5a2.4 2.4 0 0 1-4.2-1.2L3 12.1a4.2 4.2 0 0 1 4.2-4.6z"/><path d="M8 10.5v3.4M6.3 12.2h3.4"/><circle class="f" cx="15.4" cy="11.2" r="1"/><circle class="f" cx="17.4" cy="13.2" r="1"/>`),
    musik: line(`<path d="M9 18V6.2l10.5-2.4v11.9"/><circle cx="6.8" cy="18" r="2.3"/><circle cx="17.2" cy="15.7" r="2.3"/><path d="M9 9.6l10.5-2.4"/>`),
    kamera: line(`<path d="M4 8h3.2l1.6-2.3h6.4L16.8 8H20a1.2 1.2 0 0 1 1.2 1.2v8.6A1.2 1.2 0 0 1 20 19H4a1.2 1.2 0 0 1-1.2-1.2V9.2A1.2 1.2 0 0 1 4 8z"/><circle cx="12" cy="13.3" r="3.3"/><circle class="f" cx="17.6" cy="10.6" r=".8"/>`),
    video: line(`<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.2l5-2.7v9l-5-2.7"/><path class="f" d="M8.2 9.6v4.8l4-2.4z"/>`),
    surat: line(`<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.8 6.8l8.2 6 8.2-6"/>`),
    tautan: line(`<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>`),
    kode: line(`<path d="M8 7.5L3.5 12 8 16.5M16 7.5l4.5 4.5-4.5 4.5M13.6 4.5l-3.2 15"/>`),
    sakura: `<svg viewBox="-50 -50 100 100" class="solid" aria-hidden="true"><use href="#sakuraFlower"/></svg>`,
    febry: line(`<path class="sq" d="M16.8 4.8H7.4v14.4"/><path class="sq" d="M7.4 12h9.4v7.2h-5.6"/>`),
    toko: line(`<path d="M5 8.5h14l-1.2 10.3a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>`),
    harga: line(`<path d="M3.8 12.6V4.8a1 1 0 0 1 1-1h7.8l7.6 7.6a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0z"/><circle class="f" cx="8.3" cy="8.3" r="1.5"/>`),
    bayar: line(`<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M15 15h3"/>`),
    promo: line(`<rect x="3.5" y="9" width="17" height="11" rx="1.8"/><path d="M2.5 9h19v-2.2a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8zM12 6v14"/><path d="M12 6c-1.5-2.8-5-3.2-5-1.2C7 6 9.5 6 12 6zm0 0c1.5-2.8 5-3.2 5-1.2C17 6 14.5 6 12 6z"/>`),
    instan: line(`<path d="M13 2.8L5 13.5h6.2L10.5 21l8.5-11h-6.3z"/>`),
  };
})();

// Kelopak sakura berjatuhan
function makePetals(el, n) {
  if (!el) return;
  let html = "";
  for (let i = 0; i < n; i++) {
    const size = 8 + Math.random() * 10;
    html += `<i style="left:${(Math.random() * 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${(size * 0.75).toFixed(1)}px;` +
      `animation-duration:${(9 + Math.random() * 9).toFixed(1)}s,${(2.5 + Math.random() * 2.5).toFixed(1)}s;` +
      `animation-delay:${(-Math.random() * 18).toFixed(1)}s,${(-Math.random() * 4).toFixed(1)}s;opacity:${(0.55 + Math.random() * 0.45).toFixed(2)}"></i>`;
  }
  el.innerHTML = html;
}

// Maskot kucing orisinal (SVG) — ganti warna di sini kalau mau
var MASCOT_SVG = `
<svg class="mascot" viewBox="0 0 400 480" role="img" aria-label="Cat mascot">
  <defs>
    <clipPath id="faceClip"><ellipse cx="200" cy="205" rx="132" ry="118"/></clipPath>
    <radialGradient id="faceShade" cx="45%" cy="35%" r="75%">
      <stop offset="0" stop-color="#fff8ee"/><stop offset="1" stop-color="#f0dcc4"/>
    </radialGradient>
    <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd35c"/><stop offset="1" stop-color="#e9a92a"/>
    </linearGradient>
  </defs>

  <g id="mBody">
    <path d="M58 480 C58 392 118 344 200 344 C282 344 342 392 342 480 Z" fill="url(#hoodie)"/>
    <path d="M128 360 Q200 400 272 360 Q260 345 200 342 Q140 345 128 360Z" fill="#d9961f"/>
    <path d="M176 372 L170 428" stroke="#fff4e2" stroke-width="5" stroke-linecap="round"/>
    <path d="M224 372 L230 428" stroke="#fff4e2" stroke-width="5" stroke-linecap="round"/>
    <circle cx="170" cy="432" r="6" fill="#fff4e2"/><circle cx="230" cy="432" r="6" fill="#fff4e2"/>
    <path d="M140 446 Q200 432 260 446 L266 480 L134 480Z" fill="#e3a12a"/>
  </g>
  <ellipse cx="200" cy="336" rx="70" ry="14" fill="#000" opacity=".18"/>

  <g id="mHead">
    <!-- telinga -->
    <path d="M92 158 L112 34 L190 112 Z" fill="#e2924c"/>
    <path d="M112 138 L122 70 L166 114 Z" fill="#f4a9a2"/>
    <path d="M308 158 L288 34 L210 112 Z" fill="#e2924c"/>
    <path d="M288 138 L278 70 L234 114 Z" fill="#f4a9a2"/>

    <!-- wajah -->
    <ellipse cx="200" cy="205" rx="132" ry="118" fill="url(#faceShade)"/>
    <g clip-path="url(#faceClip)">
      <ellipse cx="128" cy="140" rx="78" ry="60" fill="#e2924c"/>
      <ellipse cx="290" cy="120" rx="54" ry="42" fill="#e2924c"/>
      <path d="M186 88 Q190 108 184 124" stroke="#c97636" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M200 86 Q202 110 200 128" stroke="#c97636" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M214 88 Q210 108 216 124" stroke="#c97636" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>

    <!-- alis: satu naik, satu turun = tatapan "menilai" -->
    <path d="M118 166 Q150 156 184 172" stroke="#7a3f1d" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M216 168 Q250 148 284 158" stroke="#7a3f1d" stroke-width="8" stroke-linecap="round" fill="none"/>

    <!-- mata -->
    <g id="mEyes">
      <ellipse cx="152" cy="208" rx="31" ry="27" fill="#fff"/>
      <ellipse cx="248" cy="208" rx="31" ry="27" fill="#fff"/>
      <g id="mPupilL"><circle cx="152" cy="212" r="15" fill="#1c1214"/><circle cx="158" cy="206" r="4.5" fill="#fff"/></g>
      <g id="mPupilR"><circle cx="248" cy="212" r="15" fill="#1c1214"/><circle cx="254" cy="206" r="4.5" fill="#fff"/></g>
    </g>
    <!-- kelopak setengah tertutup -->
    <path d="M118 202 Q152 186 186 196 L186 176 L118 176 Z" fill="#f7e8d6"/>
    <path d="M119 202 Q152 186 185 196" stroke="#3a2420" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M214 194 Q248 188 282 200 L282 176 L214 176 Z" fill="#f7e8d6"/>
    <path d="M215 194 Q248 188 281 200" stroke="#3a2420" stroke-width="4.5" stroke-linecap="round" fill="none"/>

    <!-- hidung, mulut, pipi, kumis -->
    <path d="M188 246 Q200 238 212 246 Q200 260 188 246Z" fill="#e0767a"/>
    <path d="M184 266 Q192 272 200 262 Q208 272 216 266" stroke="#3a2420" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="116" cy="252" rx="20" ry="11" fill="#f29a9a" opacity=".5"/>
    <ellipse cx="284" cy="252" rx="20" ry="11" fill="#f29a9a" opacity=".5"/>
    <g stroke="#cdb092" stroke-width="3" stroke-linecap="round">
      <path d="M64 240 L108 248"/><path d="M66 262 L108 258"/>
      <path d="M336 240 L292 248"/><path d="M334 262 L292 258"/>
    </g>
  </g>
</svg>`;
