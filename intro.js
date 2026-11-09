// ============================================================
//  Layar sambutan "Selamat Datang" saat halaman dibuka.
//  - huruf muncul satu per satu, bunga sakura berputar, garis loading
//  - lalu layar terangkat ke atas memperlihatkan landing page
//  - klik / Enter / Esc / tombol "Lewati" untuk melewati
//  Pengaturan ada di content/data.json → "intro".
// ============================================================
// Bungkus <img> logo supaya beranimasi terus (pantul + kilau). Dipakai di semua tempat logo.
window.animateLogo = function (img, delay) {
  if (!img || (img.parentNode && img.parentNode.classList.contains("logo-anim"))) return;
  const w = document.createElement("span");
  w.className = "logo-anim";
  w.style.setProperty("--logo", `url("${img.getAttribute("src")}")`);
  if (delay) w.style.setProperty("--d", delay);
  img.replaceWith(w);
  w.appendChild(img);
  const shine = document.createElement("span");
  shine.className = "logo-shine";
  shine.setAttribute("aria-hidden", "true");
  w.appendChild(shine);
  return w;
};

(function () {
  const root = document.documentElement;
  const el = document.getElementById("intro");
  window.setIntroData = function () {};
  if (!el) return;
  if (root.classList.contains("no-intro")) { el.remove(); return; }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const title = document.getElementById("introTitle");
  const sub = document.getElementById("introSub");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let current = "";
  function split(text) {
    current = text.trim();
    const words = current.split(/\s+/);
    let i = 0;
    title.innerHTML = words
      .map((w, wi) => `<span class="intro-word${words.length > 1 && wi === words.length - 1 ? " accent" : ""}">` +
        [...w].map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join("") + "</span>")
      .join(" ");
    title.setAttribute("aria-label", current);
  }
  split(title.textContent);

  // kelopak sakura
  const petals = document.getElementById("introPetals");
  if (petals && !reduce) {
    let html = "";
    for (let k = 0; k < (innerWidth < 760 ? 10 : 16); k++) {
      const s = 8 + Math.random() * 10;
      html += `<i style="left:${(Math.random() * 100).toFixed(1)}%;width:${s.toFixed(1)}px;height:${(s * 0.75).toFixed(1)}px;` +
        `animation-duration:${(7 + Math.random() * 7).toFixed(1)}s,${(2.5 + Math.random() * 2).toFixed(1)}s;` +
        `animation-delay:${(-Math.random() * 12).toFixed(1)}s,${(-Math.random() * 4).toFixed(1)}s;opacity:${(0.5 + Math.random() * 0.5).toFixed(2)}"></i>`;
    }
    petals.innerHTML = html;
  }

  const start = performance.now();
  const MIN = reduce ? 1200 : 3000; // lama minimal tampil (ms)
  let cfg = {}, done = false;

  window.setIntroData = function (c) {
    cfg = c.intro || {};
    if (cfg.aktif === false) return finish(true);
    if (cfg.sapaan && cfg.sapaan.trim() !== current) split(cfg.sapaan);
    const logo = document.getElementById("introLogo");
    if (c.logo && logo) {
      logo.alt = c.nama;
      logo.onload = () => { logo.hidden = false; el.classList.add("has-logo"); };
      logo.src = c.logo;
      animateLogo(logo, "0.9s");
    }
    const tpl = esc(cfg.subjudul || "di halaman {nama}");
    sub.innerHTML = tpl.replace("{nama}", `<strong>${esc(c.nama)}</strong>`);
    setTimeout(finish, Math.max(0, MIN - (performance.now() - start)));
  };

  // cadangan kalau data gagal dimuat
  setTimeout(() => finish(), 6500);

  function finish(instant) {
    if (done) return;
    done = true;
    try { if (cfg.sekaliPerSesi !== false) sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    root.classList.remove("intro-active");
    if (instant) { el.remove(); return; }
    el.classList.add("leave");
    setTimeout(() => el.remove(), reduce ? 400 : 1000);
  }

  el.addEventListener("click", () => finish());
  addEventListener("keydown", function onKey(e) {
    if (["Escape", "Enter", " "].includes(e.key)) { finish(); removeEventListener("keydown", onKey); }
  });
})();
