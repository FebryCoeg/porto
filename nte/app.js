// ============================================================
//  ARSIP HETHEREAU — database Neverness to Everness (Bahasa Indonesia)
//  SPA tanpa framework: router URL bersih, data JSON dari /nte/data/
// ============================================================
(() => {
  "use strict";
  const BASE = "/nte/";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const main = $("#main");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const img = (p) => (p ? BASE + p : "");
  // teks dari build sudah aman: hanya <b>, <i>, dan entity; tetap disaring sekali lagi
  const rich = (s) => String(s ?? "").replace(/<(?!\/?(b|i)>)/g, "&lt;");
  const elClass = (e) => "el-" + String(e || "").toLowerCase();

  const LABEL = {
    element: { Cosmos: "Cosmos", Anima: "Anima", Incantation: "Incantation", Chaos: "Chaos", Psyche: "Psyche", Lakshana: "Lakshana" },
    group: { basic: "Serangan Dasar", reflexive: "Respons Refleks", redirect: "Redirect Skill", ultimate: "Ultimate", support: "Support Skill", passive: "Pasif" },
    rarity: { 1: "Biasa", 2: "Umum", 3: "Langka", 4: "Epik", 5: "Legendaris", 6: "Mitos" },
    vehicleKind: { Car: "Mobil", Motorcycle: "Motor", Bike: "Motor", Boat: "Kapal", Ship: "Kapal", Plane: "Pesawat" },
    source: { Shop: "Toko", Quest: "Misi", Activity: "Event", Gacha: "Gacha", Default: "Bawaan" },
  };

  // ---------------- data ----------------
  const cache = {};
  const load = (name) => (cache[name] ||= fetch(`${BASE}data/${name}.json`).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }));

  // ---------------- tema & menu ----------------
  $(".theme-toggle").onclick = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("nte-theme", root.dataset.theme); } catch (e) {}
  };

  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = "hidden";
    const f = el.querySelector("input, [data-close].icon-btn, a, button");
    setTimeout(() => f && f.focus(), 30);
  }
  function closeLayer(el) {
    if (el.hidden) return;
    el.hidden = true;
    if (!$$(".drawer:not([hidden]), .search:not([hidden]), .sheet:not([hidden])").length) document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$(".drawer, .search, .sheet").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeLayer(el); }));
  $(".menu-open").onclick = () => { openLayer($("#drawer")); $(".menu-open").setAttribute("aria-expanded", "true"); };
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { ["#sheet", "#search", "#drawer"].map((s) => $(s)).find((el) => !el.hidden && (closeLayer(el), true)); $(".menu-open").setAttribute("aria-expanded", "false"); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  // ---------------- router ----------------
  const routes = [
    [/^\/$/, viewHome],
    [/^\/esper\/?$/, viewEsperList],
    [/^\/esper\/([\w-]+)\/?$/, viewEsper],
    [/^\/arc\/?$/, viewArcList],
    [/^\/arc\/([\w-]+)\/?$/, viewArc],
    [/^\/modul\/?$/, viewModules],
    [/^\/item\/?$/, viewItems],
    [/^\/furnitur\/?$/, viewFurniture],
    [/^\/kendaraan\/?$/, viewVehicles],
    [/^\/properti\/?$/, viewProperty],
    [/^\/cerita\/?$/, viewStory],
    [/^\/anomali\/?$/, viewAnomalies],
    [/^\/istilah\/?$/, viewGlossary],
    [/^\/pencapaian\/?$/, viewAchievements],
    [/^\/fashion\/?$/, viewFashion],
    [/^\/makanan\/?$/, viewFood],
  ];
  function go(url, replace) {
    if (replace) history.replaceState(null, "", url); else history.pushState(null, "", url);
    render();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link], a[href^='/']");
    if (!a || a.target || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("/portfolio") || href.startsWith("/nte/")) return;
    e.preventDefault();
    closeLayer($("#drawer")); closeLayer($("#search"));
    if (href !== location.pathname + location.search) go(href);
  });
  addEventListener("popstate", render);

  async function render() {
    const path = location.pathname.replace(/\/index\.html$/, "/") || "/";
    $$(".top-nav a, .drawer-nav a").forEach((a) => {
      const h = a.getAttribute("href");
      a.classList.toggle("active", h === "/" ? path === "/" : path.startsWith(h));
    });
    closeLayer($("#sheet"));
    const r = routes.find(([rx]) => rx.test(path));
    main.innerHTML = `<div class="loading">MEMBUKA ARSIP…</div>`;
    scrollTo(0, 0);
    try {
      if (!r) return notFound();
      await r[1](...path.match(r[0]).slice(1));
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="empty">Arsip gagal dimuat. Coba muat ulang halaman.</div>`;
    }
    main.focus({ preventScroll: true });
  }
  function setTitle(t) { document.title = t ? `${t} | Arsip Hethereau` : "Arsip Hethereau | Database Neverness to Everness Bahasa Indonesia"; }
  function notFound() {
    setTitle("Tidak ditemukan");
    main.innerHTML = `<div class="empty"><h2>Arsip tidak ditemukan</h2><p style="margin-top:8px">Halaman yang kamu cari tidak ada. <a href="/" data-link>Kembali ke beranda</a>.</p></div>`;
  }

  // ---------------- komponen kecil ----------------
  const stars = (n) => `<span class="stars">${"★".repeat(Math.max(1, n))}</span>`;
  const head = (crumb, title, desc, count) => `
    <div class="page-head">
      <div>
        <div class="crumb mono"><a href="/" data-link>ARSIP</a><span>/</span><span>${esc(crumb)}</span></div>
        <h1>${esc(title)}</h1>
        ${desc ? `<p>${desc}</p>` : ""}
      </div>
      ${count != null ? `<span class="count-tag" id="countTag">${count} ENTRI</span>` : ""}
    </div>`;
  function filterBox(placeholder) {
    return `<input class="filter-input" type="search" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off" />`;
  }
  function chips(list, key, current, all = "Semua") {
    return `<div class="chips" data-key="${key}">
      <button class="chip" type="button" data-v="" aria-pressed="${!current}">${all}</button>
      ${list.map((x) => `<button class="chip ${x.cls || ""}" type="button" data-v="${esc(x.v)}" aria-pressed="${current === x.v}">${x.dot ? '<span class="dot"></span>' : ""}${x.icon ? `<img src="${img(x.icon)}" alt="">` : ""}${esc(x.label)}</button>`).join("")}
    </div>`;
  }
  // filter sederhana: state di URL (?q=&el=…) supaya bisa dibagikan
  function useFilters(onChange) {
    const params = new URLSearchParams(location.search);
    const state = Object.fromEntries(params);
    const input = $(".filter-input", main);
    if (input) {
      input.value = state.q || "";
      let t;
      input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = input.value.trim(); sync(); }, 120); });
    }
    $$(".chips", main).forEach((box) => box.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      state[box.dataset.key] = b.dataset.v;
      $$(".chip", box).forEach((c) => c.setAttribute("aria-pressed", c === b));
      sync();
    }));
    function sync() {
      const p = new URLSearchParams();
      Object.entries(state).forEach(([k, v]) => v && p.set(k, v));
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
      onChange(state);
    }
    onChange(state);
    return state;
  }
  const match = (q, ...fields) => !q || fields.some((f) => String(f || "").toLowerCase().includes(q.toLowerCase()));
  function setCount(n) { const c = $("#countTag"); if (c) c.textContent = `${n} ENTRI`; }

  // ---------------- BERANDA ----------------
  async function viewHome() {
    setTitle("");
    const [espers, arcs, mods, items, furn, veh, prop, story, anomalies, glossary, achievements, fashion, food] = await Promise.all([
      "espers", "arcs", "modules", "items", "furniture", "vehicles", "property", "story", "anomalies", "glossary", "achievements", "fashion", "food"
    ].map(load));
    const picks = ["iroi", "elyms", "crimson", "chiz", "lacrimosa", "sakiri"].map((s) => espers.find((e) => e.slug === s)).filter(Boolean).slice(0, 3);
    while (picks.length < 3 && espers[picks.length]) picks.push(espers[picks.length]);
    const thumbs = (arr, key = "icon") => arr.filter((x) => x[key]).slice(0, 3).map((x) => `<img src="${img(x[key])}" alt="" loading="lazy">`).join("");
    const cats = [
      ["/esper", "01", S("Esper", "Espers"), S("Karakter, skill, awakening, dan arsip cerita", "Characters, skills, awakenings & lore"), espers.length, thumbs(espers)],
      ["/arc", "02", S("Arc", "Arcs"), S("Efek per tingkat bintang ★1–★5", "Effects across ★1–★5 stars"), arcs.length, thumbs(arcs)],
      ["/modul", "03", S("Modul", "Modules"), S("Set modul dan bonus 2/4 keping", "Module sets & 2/4-piece set bonuses"), mods.modules.length, thumbs(mods.sets)],
      ["/item", "04", S("Item", "Items"), S("Material, hadiah, koleksi, dan lainnya", "Materials, gifts, collectibles & more"), items.items.length, thumbs(items.items.filter((i) => i.rarity >= 4))],
      ["/furnitur", "05", S("Furnitur", "Furniture"), S("Isi rumahmu di Hethereau", "Decorate your home in Hethereau"), furn.length, thumbs(furn.filter((i) => i.rarity >= 4))],
      ["/kendaraan", "06", S("Kendaraan", "Vehicles"), S("Mobil dan motor beserta mereknya", "Cars & bikes by brand"), veh.length, thumbs(veh)],
      ["/properti", "07", S("Properti", "Property"), S("Apartemen dan rumah yang bisa dibeli", "Buyable apartments & houses"), prop.length, ""],
      ["/cerita", "08", S("Cerita", "Story"), S("Ringkasan bab Prolog, Main Story 1.0–1.5, dan Spinoff", "Prologue, Main Story 1.0–1.5 & Spinoff recaps"), story.length, ""],
      ["/anomali", "09", S("Anomali", "Anomalies"), S("Katalog Anomaly, kode, kutipan, dan data monster/boss", "Anomaly database, codes, lore & bosses"), anomalies.anomalies.length + anomalies.monsters.length, ""],
      ["/istilah", "10", S("Istilah", "Glossary"), S("Panduan istilah resmi dunia Neverness to Everness", "Official terminology manual of NTE"), glossary.length, ""],
      ["/pencapaian", "11", S("Pencapaian", "Achievements"), S("Daftar achievement per kategori dan syaratnya", "Achievements by category & conditions"), achievements.items.length, ""],
      ["/fashion", "12", "Fashion", S("Kostum karakter dan deskripsi temanya", "Character outfits & appearance lore"), fashion.length, ""],
      ["/makanan", "13", S("Makanan", "Food"), S("Menu makanan, efek penyembuhan/buff, dan bahan masak", "Dishes, restoration/buff effects & ingredients"), food.length, ""],
    ];
    main.innerHTML = `
      <section class="home-hero">
        <div>
          <span class="mono">BERKAS NO. NTE-ID / VERSI ${new Date().getFullYear()}</span>
          <h1>${S("Semua tentang <em>Hethereau</em>, dalam Bahasa Indonesia.", "All of <em>Hethereau</em>, official database.")}</h1>
          <p>${S("Database lengkap Neverness to Everness: Esper, Arc, Modul, Item, Kendaraan, Cerita, Anomali, Pencapaian, hingga Makanan langsung dari teks game.", "Complete Neverness to Everness database: Espers, Arcs, Modules, Items, Vehicles, Lore, Anomalies, Achievements, and Food directly from game text.")}</p>
          <div class="home-actions">
            <a class="btn" href="/esper" data-link>${S("Lihat semua Esper →", "View all Espers →")}</a>
            <button class="btn ghost" type="button" id="heroSearch">${S("Cari sesuatu", "Search database")} <span class="kbd">Ctrl K</span></button>
          </div>
          <div class="home-stats">
            <div><b>${espers.length}</b><span>${S("Esper", "Espers")}</span></div>
            <div><b>${arcs.length}</b><span>${S("Arc", "Arcs")}</span></div>
            <div><b>${story.length}</b><span>${S("Bab Cerita", "Story Chapters")}</span></div>
            <div><b>${anomalies.anomalies.length}</b><span>${S("Anomali", "Anomalies")}</span></div>
            <div><b>${achievements.items.length}</b><span>${S("Pencapaian", "Achievements")}</span></div>
          </div>
        </div>
        <div class="collage">
          ${picks.map((e) => `<a class="polaroid ${elClass(e.element)}" href="/esper/${e.slug}" data-link><img src="${img(e.portrait || e.icon)}" alt="${esc(e.name)}"><span>${esc(e.name.toUpperCase())}</span></a>`).join("")}
        </div>
      </section>
      <div class="section-title"><h2>Indeks arsip</h2><span class="mono">7 KATEGORI</span></div>
      <div class="cat-grid">
        ${cats.map(([href, n, t, d, c, th]) => `<a class="cat-card" href="${href}" data-link><i>${n}</i><div class="cat-thumbs">${th}</div><h3>${t}</h3><p>${d}</p><span class="num">${c}</span></a>`).join("")}
      </div>
      <div class="section-title"><h2>Esper</h2><a href="/esper" data-link>Semua Esper →</a></div>
      <div class="esper-grid">${espers.slice(0, 6).map(esperCard).join("")}</div>`;
    $("#heroSearch").onclick = openSearch;
  }

  // ---------------- ESPER ----------------
  function esperCard(e) {
    return `<a class="esper-card ${elClass(e.element)}" href="/esper/${e.slug}" data-link>
      <div class="esper-art">
        <span class="idcode">ESP-${esc(e.id)}</span>
        <span class="stamp rank-${e.rank}">${e.rank}</span>
        <img src="${img(e.portrait || e.icon)}" alt="" loading="lazy">
      </div>
      <div class="esper-meta"><b>${esc(e.name)}</b><small><span class="dot"></span>${esc(e.element)} · ${esc(e.arcType)}</small></div>
    </a>`;
  }
  async function viewEsperList() {
    setTitle("Esper");
    const list = await load("espers");
    const els = [...new Set(list.map((e) => e.element))];
    const types = [...new Map(list.map((e) => [e.arcType, e.arcTypeIcon])).entries()].filter(([t]) => t);
    main.innerHTML = head("ESPER", "Esper", "Semua karakter yang bisa dimainkan. Pilih satu untuk membuka berkasnya: skill, awakening, profil, dan cerita.", list.length) + `
      <div class="toolbar">
        ${filterBox("Cari nama Esper…")}
        ${chips(els.map((x) => ({ v: x, label: x, dot: true, cls: elClass(x) })), "el")}
        <span class="chip-sep"></span>
        ${chips([{ v: "S", label: "Rank S" }, { v: "A", label: "Rank A" }], "rank")}
        <span class="chip-sep"></span>
        ${chips(types.map(([t, i]) => ({ v: t, label: t, icon: i })), "type", undefined, "Semua tipe")}
      </div>
      <div class="esper-grid" id="grid"></div>`;
    useFilters((s) => {
      const out = list.filter((e) => match(s.q, e.name, e.title) && (!s.el || e.element === s.el) && (!s.rank || e.rank === s.rank) && (!s.type || e.arcType === s.type));
      $("#grid").innerHTML = out.length ? out.map(esperCard).join("") : `<div class="empty">Tidak ada Esper yang cocok.</div>`;
      setCount(out.length);
    });
  }
  async function viewEsper(slug) {
    const list = await load("espers");
    const e = list.find((x) => x.slug === slug);
    if (!e) return notFound();
    setTitle(e.name);
    const p = e.profile || {};
    const facts = [["Ulang tahun", p.birthday], ["Faksi", p.faction], ["Kemampuan Esper", p.esperAbility], ["Pekerjaan", p.occupation], ["Kesukaan", p.food]].filter(([, v]) => v);
    const tabs = [
      ["skill", "Skill", e.skills.length],
      ["awakening", "Awakening", e.awakening.length],
      ["console", "Console", e.console.length],
      ["profil", "Profil", p.intro || p.impression ? 1 : 0],
      ["cerita", "Arsip Cerita", (p.stories || []).length],
    ].filter(([, , n]) => n);
    main.innerHTML = `
      <div class="crumb mono"><a href="/" data-link>ARSIP</a><span>/</span><a href="/esper" data-link>ESPER</a><span>/</span><span>${esc(e.name.toUpperCase())}</span></div>
      <article class="dossier ${elClass(e.element)}">
        <div class="dossier-art">
          <span class="idcode">BERKAS ESP-${esc(e.id)}</span>
          <span class="stamp rank-${e.rank}">${e.rank}</span>
          <img src="${img(e.portrait || e.icon)}" alt="${esc(e.name)}">
        </div>
        <div>
          <div class="dossier-head">
            <span class="mono">${esc(e.title || "Esper")}</span>
            <h1>${esc(e.name)}</h1>
          </div>
          <div class="tags">
            <span class="tag"><span class="dot"></span>${esc(e.element)}</span>
            <span class="tag">${e.arcTypeIcon ? `<img src="${img(e.arcTypeIcon)}" alt="">` : ""}Arc ${esc(e.arcType)}</span>
            <span class="tag">Rank ${e.rank}</span>
          </div>
          ${e.desc ? `<p class="lede txt">${rich(e.desc)}</p>` : ""}
          ${facts.length ? `<div class="facts">${facts.map(([k, v]) => `<div class="fact"><span>${k}</span><b>${esc(v)}</b></div>`).join("")}</div>` : ""}
          <div class="tabs" role="tablist">${tabs.map(([id, t], i) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${i === 0}">${t}</button>`).join("")}</div>
          <div id="tabBody" class="tab-panel"></div>
        </div>
      </article>`;
    const panels = {
      skill: () => {
        let out = "", last = "";
        e.skills.forEach((s) => {
          if (s.group !== last) { out += `<div class="group-label">${LABEL.group[s.group] || s.group}</div>`; last = s.group; }
          out += `<div class="entry"><h4>${esc(s.name)}</h4><p class="txt">${rich(s.desc)}</p>${s.quote ? `<p class="quote">${rich(s.quote)}</p>` : ""}</div>`;
        });
        return out;
      },
      awakening: () => e.awakening.map((a, i) => `<div class="entry"><h4>${a.icon ? `<img src="${img(a.icon)}" alt="">` : ""}<span class="lv">★${i + 1}</span>${esc(a.name)}</h4><p class="txt">${rich(a.desc)}</p></div>`).join(""),
      console: () => `<p class="mono" style="margin-bottom:10px">Efek tambahan yang terbuka lewat Console (空幕)</p>` + e.console.map((a) => `<div class="entry"><h4>${esc(a.name)}</h4><p class="txt">${rich(a.desc)}</p></div>`).join(""),
      profil: () => `${p.quote ? `<p class="lede txt" style="font-style:italic">${rich(p.quote)}</p>` : ""}
        ${p.intro ? `<div class="entry" style="margin-top:14px"><h4>Ringkasan</h4><p class="txt">${rich(p.intro)}</p></div>` : ""}
        ${p.impression ? `<div class="entry"><h4>Kesan pertama</h4><p class="txt">${rich(p.impression)}</p></div>` : ""}`,
      cerita: () => (p.stories || []).map((s, i) => `<div class="story" data-n="ARSIP ${String(i + 1).padStart(2, "0")}">${s.title ? `<h4>${esc(s.title)}</h4>` : ""}<p class="txt">${rich(s.text)}</p></div>`).join(""),
    };
    const show = (id) => {
      $$(".tab", main).forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === id));
      $("#tabBody").innerHTML = panels[id]();
    };
    $(".tabs", main).addEventListener("click", (ev) => { const t = ev.target.closest(".tab"); if (t) show(t.dataset.tab); });
    if (tabs.length) show(tabs[0][0]);
  }

  // ---------------- ARC ----------------
  function arcTile(a) {
    return `<a class="tile q${a.rarity}" href="/arc/${a.slug}" data-link>
      <div class="tile-img"><img src="${img(a.icon)}" alt="" loading="lazy"></div>
      <div class="tile-body"><b>${esc(a.name)}</b><small>${stars(a.rarity)} · ${esc(a.type)}</small></div>
    </a>`;
  }
  async function viewArcList() {
    setTitle("Arc");
    const list = await load("arcs");
    const types = [...new Map(list.map((a) => [a.type, a.typeIcon])).entries()].filter(([t]) => t);
    const rar = [...new Set(list.map((a) => a.rarity))].sort((a, b) => b - a);
    main.innerHTML = head("ARC", "Arc", "Senjata para Esper. Buka satu Arc untuk melihat efeknya di setiap tingkat bintang.", list.length) + `
      <div class="toolbar">
        ${filterBox("Cari nama Arc…")}
        ${chips(rar.map((r) => ({ v: String(r), label: "★".repeat(r) })), "r")}
        <span class="chip-sep"></span>
        ${chips(types.map(([t, i]) => ({ v: t, label: t, icon: i })), "type", undefined, "Semua tipe")}
      </div>
      <div class="tile-grid" id="grid"></div>`;
    useFilters((s) => {
      const out = list.filter((a) => match(s.q, a.name) && (!s.r || String(a.rarity) === s.r) && (!s.type || a.type === s.type));
      $("#grid").innerHTML = out.length ? out.map(arcTile).join("") : `<div class="empty">Tidak ada Arc yang cocok.</div>`;
      setCount(out.length);
    });
  }
  async function viewArc(slug) {
    const list = await load("arcs");
    const a = list.find((x) => x.slug === slug);
    if (!a) return notFound();
    setTitle(a.name);
    const espers = (await load("espers")).filter((e) => e.arcType === a.type);
    main.innerHTML = `
      <div class="crumb mono"><a href="/" data-link>ARSIP</a><span>/</span><a href="/arc" data-link>ARC</a><span>/</span><span>${esc(a.name.toUpperCase())}</span></div>
      <article class="arc-detail q${a.rarity}">
        <div class="arc-card-img"><img src="${img(a.card || a.icon)}" alt="${esc(a.name)}"></div>
        <div>
          <span class="mono">ARC · ${esc(LABEL.rarity[a.rarity] || "")}</span>
          <div class="dossier-head"><h1>${esc(a.name)}</h1></div>
          <div class="tags">
            <span class="tag">${stars(a.rarity)}</span>
            <span class="tag">${a.typeIcon ? `<img src="${img(a.typeIcon)}" alt="">` : ""}${esc(a.type)}</span>
          </div>
          ${a.desc ? `<p class="lede txt" style="font-style:italic">${rich(a.desc)}</p>` : ""}
          ${a.effect ? `
            <div class="group-label">Efek Arc</div>
            <div class="entry">
              <h4>${esc(a.effect.name)}</h4>
              <div class="star-pick" role="group" aria-label="Tingkat bintang">${a.effect.values.map((_, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">★${i + 1}</button>`).join("")}</div>
              <p class="txt" id="arcFx"></p>
            </div>` : ""}
          ${espers.length ? `<div class="group-label">Bisa dipakai oleh (Arc ${esc(a.type)})</div><div class="esper-grid">${espers.map(esperCard).join("")}</div>` : ""}
        </div>
      </article>`;
    if (a.effect) {
      const put = (i) => {
        $("#arcFx").innerHTML = rich(a.effect.text).replace(/\{(\d+)\}/g, (_, n) => `<span class="val">${esc(a.effect.values[i][n] ?? "?")}</span>`);
        $$(".star-pick button", main).forEach((b) => b.setAttribute("aria-pressed", b.dataset.s == i));
      };
      $(".star-pick", main).addEventListener("click", (ev) => { const b = ev.target.closest("button"); if (b) put(+b.dataset.s); });
      put(0);
    }
  }

  // ---------------- MODUL ----------------
  async function viewModules() {
    setTitle("Modul");
    const d = await load("modules");
    main.innerHTML = head("MODUL", "Modul", "Modul dipasang ke Console (空幕) Esper. Kumpulkan 2 atau 4 keping dari set yang sama untuk bonus tambahan.", d.modules.length) + `
      <div class="section-title"><h2>Set modul</h2><span class="mono">${d.sets.length} SET</span></div>
      <div class="set-grid">${d.sets.map((s) => `
        <div class="set-card">
          <header>${s.icon ? `<img src="${img(s.icon)}" alt="">` : ""}<div><h3>${esc(s.name)}</h3><span class="mono">${s.modules.length} MODUL</span></div></header>
          ${s.bonuses.map((b) => `<div class="bonus"><i>${b.pieces} KEPING</i><p class="txt">${rich(b.text)}</p></div>`).join("")}
        </div>`).join("")}
      </div>
      <div class="section-title"><h2>Semua modul</h2></div>
      <div class="toolbar">${filterBox("Cari modul…")}${chips([...new Set(d.modules.map((m) => m.set).filter(Boolean))].map((x) => ({ v: x, label: x })), "set", undefined, "Semua set")}</div>
      <div class="tile-grid" id="grid"></div>`;
    useFilters((s) => {
      const out = d.modules.filter((m) => match(s.q, m.name, m.set) && (!s.set || m.set === s.set));
      $("#grid").innerHTML = out.map((m) => `<button class="tile q${m.rarity}" type="button" data-id="${esc(m.id)}">
        <div class="tile-img"><img src="${img(m.icon)}" alt="" loading="lazy"></div>
        <div class="tile-body"><b>${esc(m.name)}</b><small>${m.set ? esc(m.set) : esc(m.kind || "Modul")}${m.core ? " · Inti" : ""}</small></div></button>`).join("") || `<div class="empty">Tidak ada modul yang cocok.</div>`;
      setCount(out.length);
    });
    $("#grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".tile"); if (!b) return;
      const m = d.modules.find((x) => x.id === b.dataset.id);
      const set = d.sets.find((x) => x.name === m.set);
      sheet(m, `<span class="mono">MODUL · ${esc(LABEL.rarity[m.rarity] || "")}${m.slots ? ` · ${esc(m.slots)} PETAK` : ""}</span>`,
        `${m.desc ? `<p class="txt">${rich(m.desc)}</p>` : ""}${set ? `<div class="group-label">Set ${esc(set.name)}</div>${set.bonuses.map((x) => `<div class="bonus"><i>${x.pieces} KEPING</i><p class="txt">${rich(x.text)}</p></div>`).join("")}` : ""}`);
    });
  }

  // ---------------- panel detail ----------------
  function sheet(x, kicker, body, cover) {
    $("#sheetBody").innerHTML = `
      <div class="sheet-hero q${x.rarity || 1}${cover ? " cover" : ""}">${(x.icon || x.image) ? `<img src="${img(x.image || x.icon)}" alt="">` : ""}</div>
      <div class="sheet-body q${x.rarity || 1}">
        ${kicker}
        <h2>${esc(x.name)}</h2>
        ${x.rarity ? `<div style="margin-top:6px">${stars(x.rarity)}</div>` : ""}
        ${body}
      </div>`;
    openLayer($("#sheet"));
  }

  // ---------------- ITEM ----------------
  async function viewItems() {
    setTitle("Item");
    const d = await load("items");
    const counts = {};
    d.items.forEach((i) => (counts[i.cat] = (counts[i.cat] || 0) + 1));
    const cats = d.categories.filter((c) => counts[c.id]);
    const params = new URLSearchParams(location.search);
    let cat = params.get("kat") || "";
    main.innerHTML = head("ITEM", "Item", "Semua barang di tas: material pengembangan, hadiah, koleksi, kostum, dan lainnya.", d.items.length) + `
      <div class="item-layout">
        <div class="cat-side" id="cats">
          <button type="button" data-c="" aria-pressed="${!cat}">Semua<span>${d.items.length}</span></button>
          ${cats.map((c) => `<button type="button" data-c="${c.id}" aria-pressed="${cat === c.id}">${esc(c.name)}<span>${counts[c.id]}</span></button>`).join("")}
        </div>
        <div>
          <div class="toolbar">${filterBox("Cari item…")}${chips([5, 4, 3, 2, 1].map((r) => ({ v: String(r), label: "★".repeat(r) })), "r")}</div>
          <div class="tile-grid" id="grid"></div>
          <div class="more"><button class="btn ghost" type="button" id="more" hidden>Tampilkan lebih banyak</button></div>
        </div>
      </div>`;
    let state = {}, limit = 120;
    const draw = () => {
      const out = d.items.filter((i) => (!cat || i.cat === cat) && match(state.q, i.name, i.desc) && (!state.r || String(i.rarity) === state.r));
      $("#grid").innerHTML = out.slice(0, limit).map((i) => `<button class="tile q${i.rarity}" type="button" data-id="${esc(i.id)}">
        <div class="tile-img"><img src="${img(i.icon)}" alt="" loading="lazy"></div>
        <div class="tile-body"><b>${esc(i.name)}</b></div></button>`).join("") || `<div class="empty">Tidak ada item yang cocok.</div>`;
      $("#more").hidden = out.length <= limit;
      setCount(out.length);
    };
    state = useFilters((s) => { state = s; limit = 120; draw(); });
    $("#cats").addEventListener("click", (ev) => {
      const b = ev.target.closest("button"); if (!b) return;
      cat = b.dataset.c; limit = 120;
      $$("#cats button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      const p = new URLSearchParams(location.search); cat ? p.set("kat", cat) : p.delete("kat");
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
      draw();
    });
    $("#more").onclick = () => { limit += 120; draw(); };
    $("#grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".tile"); if (!b) return;
      const i = d.items.find((x) => x.id === b.dataset.id);
      const c = d.categories.find((x) => x.id === i.cat);
      sheet(i, `<span class="mono">ITEM · ${esc(c ? c.name : "")}</span>`,
        `${i.use ? `<div class="use txt">${rich(i.use)}</div>` : ""}${i.desc ? `<p class="txt">${rich(i.desc)}</p>` : ""}`);
    });
  }

  // ---------------- FURNITUR ----------------
  const FSTAT = { Comfort: "Kenyamanan", Fortune: "Keberuntungan", Love: "Kehangatan", Collect: "Nilai koleksi" };
  async function viewFurniture() {
    setTitle("Furnitur");
    const list = await load("furniture");
    main.innerHTML = head("FURNITUR", "Furnitur", "Perabot untuk mengisi rumahmu. Tiap furnitur punya nilai kenyamanan, keberuntungan, kehangatan, dan koleksi.", list.length) + `
      <div class="toolbar">${filterBox("Cari furnitur…")}${chips([5, 4, 3, 2].map((r) => ({ v: String(r), label: "★".repeat(r) })), "r")}</div>
      <div class="tile-grid" id="grid"></div>
      <div class="more"><button class="btn ghost" type="button" id="more" hidden>Tampilkan lebih banyak</button></div>`;
    let state = {}, limit = 120;
    const draw = () => {
      const out = list.filter((i) => match(state.q, i.name, i.desc) && (!state.r || String(i.rarity) === state.r));
      $("#grid").innerHTML = out.slice(0, limit).map((i) => `<button class="tile q${i.rarity}" type="button" data-id="${esc(i.id)}">
        <div class="tile-img"><img src="${img(i.icon)}" alt="" loading="lazy"></div>
        <div class="tile-body"><b>${esc(i.name)}</b>${i.stats && i.stats.Comfort ? `<small>Kenyamanan +${i.stats.Comfort}</small>` : ""}</div></button>`).join("") || `<div class="empty">Tidak ada furnitur yang cocok.</div>`;
      $("#more").hidden = out.length <= limit;
      setCount(out.length);
    };
    useFilters((s) => { state = s; limit = 120; draw(); });
    $("#more").onclick = () => { limit += 120; draw(); };
    $("#grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".tile"); if (!b) return;
      const i = list.find((x) => x.id === b.dataset.id);
      const st = Object.entries(i.stats || {}).filter(([, v]) => v);
      sheet(i, `<span class="mono">FURNITUR</span>`,
        `${st.length ? `<div class="stat-row">${st.map(([k, v]) => `<div class="fact"><span>${FSTAT[k] || k}</span><b>+${v}</b></div>`).join("")}</div>` : ""}
         ${i.use ? `<div class="use txt">${rich(i.use)}</div>` : ""}${i.desc ? `<p class="txt">${rich(i.desc)}</p>` : ""}`);
    });
  }

  // ---------------- KENDARAAN ----------------
  async function viewVehicles() {
    setTitle("Kendaraan");
    const list = await load("vehicles");
    const brands = [...new Set(list.map((v) => v.brand).filter(Boolean))].sort();
    main.innerHTML = head("KENDARAAN", "Kendaraan", "Mobil dan motor yang bisa kamu kendarai keliling Hethereau.", list.length) + `
      <div class="toolbar">${filterBox("Cari kendaraan…")}${chips(brands.map((b) => ({ v: b, label: b })), "brand", undefined, "Semua merek")}</div>
      <div class="wide-grid" id="grid"></div>`;
    useFilters((s) => {
      const out = list.filter((v) => match(s.q, v.name, v.brand) && (!s.brand || v.brand === s.brand));
      $("#grid").innerHTML = out.map((v) => `<button class="wcard" type="button" data-id="${esc(v.id)}">
        <div class="wcard-img">${v.icon ? `<img src="${img(v.icon)}" alt="" loading="lazy">` : ""}</div>
        <div class="wcard-body"><small>${esc(v.brand || "")}</small><b>${esc(v.name)}</b><p>${rich(v.desc).replace(/<[^>]+>/g, "")}</p></div></button>`).join("") || `<div class="empty">Tidak ada kendaraan yang cocok.</div>`;
      setCount(out.length);
    });
    $("#grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".wcard"); if (!b) return;
      const v = list.find((x) => x.id === b.dataset.id);
      sheet(v, `<span class="mono">KENDARAAN · ${esc(v.brand || "")}</span>`,
        `<div class="stat-row">${v.kind ? `<div class="fact"><span>Jenis</span><b>${esc(LABEL.vehicleKind[v.kind] || v.kind)}</b></div>` : ""}${v.source ? `<div class="fact"><span>Didapat dari</span><b>${esc(LABEL.source[v.source] || v.source)}</b></div>` : ""}</div>
         <p class="txt">${rich(v.desc)}</p>`);
    });
  }

  // ---------------- PROPERTI ----------------
  async function viewProperty() {
    setTitle("Properti");
    const list = await load("property");
    main.innerHTML = head("PROPERTI", "Properti", "Apartemen dan hunian yang bisa kamu beli di Hethereau.", list.length) + `
      <div class="wide-grid">${list.map((p) => `
        <button class="wcard" type="button" data-id="${esc(p.id)}">
          <div class="wcard-img">${p.image ? `<img src="${img(p.image)}" alt="" loading="lazy">` : ""}</div>
          <div class="wcard-body"><small>${esc(p.area)}</small><b>${esc(p.name)}</b><p>${rich(p.slogan)}</p></div>
        </button>`).join("")}
      </div>`;
    main.querySelector(".wide-grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".wcard"); if (!b) return;
      const p = list.find((x) => x.id === b.dataset.id);
      sheet(p, `<span class="mono">PROPERTI · ${esc(p.area)}</span>`,
        `${p.slogan ? `<p class="lede txt" style="margin-top:12px">${rich(p.slogan)}</p>` : ""}
         ${p.address ? `<div class="use"><b>Alamat:</b> ${esc(p.address)}</div>` : ""}
         ${p.desc ? `<p class="txt">${rich(p.desc)}</p>` : ""}`);
    });
  }

  // ---------------- BAHASA (ID / EN) untuk kategori data game ----------------
  let LANG = (() => { try { return localStorage.getItem("nte-lang") === "en" ? "en" : "id"; } catch (e) { return "id"; } })();
  const tx = (o) => (o ? o[LANG] || o.en || "" : "");
  const S = (id, en) => (LANG === "en" ? en : id);
  const strip = (s) => String(s || "").replace(/<[^>]+>/g, "");
  const paras = (s) => rich(s).split(/\n+/).filter(Boolean).map((p) => `<p class="txt" style="margin-top:10px">${p}</p>`).join("");
  const langBtn = $(".lang-toggle");
  const syncLangBtn = () => { if (langBtn) { langBtn.textContent = LANG.toUpperCase(); langBtn.setAttribute("aria-label", S("Ganti bahasa (sekarang Indonesia)", "Switch language (now English)")); } document.documentElement.lang = LANG; };
  if (langBtn) langBtn.onclick = () => {
    LANG = LANG === "id" ? "en" : "id";
    try { localStorage.setItem("nte-lang", LANG); } catch (e) {}
    index = null; syncLangBtn(); render();
  };

  // halaman daftar teks generik (cerita, anomali, istilah, pencapaian, fashion, makanan)
  function textPage(o) {
    setTitle(o.title);
    const rows = o.list.map((x, n) => ({ x, n }));
    main.innerHTML = head(o.crumb, o.title, o.desc, rows.length) + `
      <div class="toolbar">${filterBox(o.placeholder)}${o.chipDefs && o.chipDefs.length ? chips(o.chipDefs, "c", undefined, S("Semua", "All")) : ""}</div>
      <div class="wide-grid" id="grid"></div>
      <div class="more"><button class="btn ghost" type="button" id="more" hidden>${S("Tampilkan lebih banyak", "Show more")}</button></div>`;
    let state = {}, limit = 90;
    const draw = () => {
      const out = rows.filter(({ x }) => match(state.q, ...o.search(x)) && (!state.c || o.chipOf(x) === state.c));
      $("#grid").innerHTML = out.slice(0, limit).map(({ x, n }) => {
        const c = o.card(x);
        return `<button class="wcard" type="button" data-n="${n}"><div class="wcard-body"><small>${esc(c.k || "")}</small><b>${esc(c.t)}</b>${c.p ? `<p>${esc(c.p)}</p>` : ""}</div></button>`;
      }).join("") || `<div class="empty">${S("Tidak ada entri yang cocok.", "No matching entries.")}</div>`;
      $("#more").hidden = out.length <= limit;
      setCount(out.length);
    };
    useFilters((s) => { state = s; limit = 90; draw(); });
    $("#more").onclick = () => { limit += 90; draw(); };
    $("#grid").addEventListener("click", (ev) => {
      const b = ev.target.closest(".wcard"); if (!b) return;
      const d = o.open(o.list[+b.dataset.n]);
      sheet({ name: d.name }, `<span class="mono">${esc(d.kicker)}</span>`, d.body);
    });
  }
  const fact = (k, v) => (v ? `<div class="fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>` : "");
  const CLS = (l, n) => `${l} · ${S("Sumber: arsip teks game Global", "Source: Global game text")}${n ? ` · ${n}` : ""}`;

  async function viewStory() {
    const list = await load("story");
    const grp = { utama: S("Cerita Utama", "Main Story"), spinoff: "Spinoff" };
    textPage({
      crumb: S("CERITA", "STORY"), title: S("Cerita & Quest", "Story & Quests"),
      desc: S("Ringkasan resmi setiap bab cerita utama dan spinoff karakter, langsung dari teks game.", "Official chapter recaps for the main story and character spinoffs, straight from the game text."),
      placeholder: S("Cari bab atau karakter…", "Search chapters or characters…"),
      list, search: (x) => [tx(x.title), tx(x.summary)],
      chipDefs: Object.entries(grp).map(([v, label]) => ({ v, label })), chipOf: (x) => x.group,
      card: (x) => ({ k: `${grp[x.group]}${x.chapter ? " · " + tx(x.chapter) : ""}`, t: tx(x.title), p: strip(tx(x.summary)) }),
      open: (x) => ({ name: tx(x.title), kicker: `${grp[x.group].toUpperCase()}${x.chapter ? " · " + tx(x.chapter).toUpperCase() : ""}`, body: paras(tx(x.summary)) }),
    });
  }

  async function viewAnomalies() {
    const d = await load("anomalies");
    const list = [
      ...d.anomalies.map((a) => ({ t: "a", ...a })),
      ...d.monsters.map((m) => ({ t: "m", ...m })),
    ];
    const kind = { a: S("Anomali", "Anomaly"), m: S("Monster & Boss", "Monsters & Bosses") };
    textPage({
      crumb: S("ANOMALI", "ANOMALIES"), title: S("Anomali & Monster", "Anomalies & Monsters"),
      desc: S("Arsip anomali Hethereau beserta kode, kutipan, dan kisahnya, plus catatan monster dan boss.", "The Hethereau anomaly archive with codes, quotes and stories, plus monster and boss notes."),
      placeholder: S("Cari anomali atau monster…", "Search anomalies or monsters…"),
      list, search: (x) => [x.name, x.code, tx(x.quote), tx(x.story), tx(x.desc)],
      chipDefs: Object.entries(kind).map(([v, label]) => ({ v, label })), chipOf: (x) => x.t,
      card: (x) => x.t === "a"
        ? { k: x.code, t: x.name, p: strip(tx(x.quote)) }
        : { k: x.kind, t: `${x.kind} #${x.id.split("_")[1]}`, p: strip(tx(x.desc)) },
      open: (x) => x.t === "a"
        ? { name: x.name, kicker: `${S("ANOMALI", "ANOMALY")} · ${x.code}`, body: `<p class="lede txt" style="margin-top:12px">${rich(tx(x.quote))}</p>${x.story ? `<div class="use"><b>${S("Kisah", "Story")}</b></div>${paras(tx(x.story))}` : ""}` }
        : { name: `${x.kind} #${x.id.split("_")[1]}`, kicker: x.kind.toUpperCase(), body: paras(tx(x.desc)) },
    });
  }

  async function viewGlossary() {
    const list = await load("glossary");
    textPage({
      crumb: S("ISTILAH", "GLOSSARY"), title: S("Istilah Dunia NTE", "NTE Glossary"),
      desc: S("Arti istilah yang dipakai di dunia Neverness to Everness, dari buku panduan dalam game.", "Meanings of terms used in the world of Neverness to Everness, from the in-game manual."),
      placeholder: S("Cari istilah…", "Search terms…"),
      list, search: (x) => [tx(x.name), tx(x.desc)], chipDefs: [], chipOf: () => "",
      card: (x) => ({ k: S("Istilah", "Term"), t: x.name.en, p: strip(tx(x.desc)) }),
      open: (x) => ({ name: S(x.name.id, x.name.en), kicker: S("ISTILAH", "TERM"), body: paras(tx(x.desc)) }),
    });
  }

  async function viewAchievements() {
    const d = await load("achievements");
    const cats = Object.fromEntries(d.categories.map((c) => [c.id, c.name]));
    const CE = { Life: "Life", friendship: "Friendship", explore: "Exploration", Play: "Activities", battle: "Combat", develop: "Development", interest: "Hobbies", quest: "Quests", Playstation: "Playstation" };
    const cn = (id) => S(cats[id], CE[id]);
    textPage({
      crumb: S("PENCAPAIAN", "ACHIEVEMENTS"), title: S("Pencapaian", "Achievements"),
      desc: S("Daftar pencapaian dan syarat menyelesaikannya.", "Every achievement and how to earn it."),
      placeholder: S("Cari pencapaian…", "Search achievements…"),
      list: d.items, search: (x) => [tx(x.title), tx(x.desc), x.title.en],
      chipDefs: d.categories.map((c) => ({ v: c.id, label: cn(c.id) })), chipOf: (x) => x.cat,
      card: (x) => ({ k: cn(x.cat), t: tx(x.title), p: tx(x.desc) }),
      open: (x) => ({ name: tx(x.title), kicker: `${S("PENCAPAIAN", "ACHIEVEMENT")} · ${cn(x.cat).toUpperCase()}`, body: `<p class="txt" style="margin-top:12px">${rich(tx(x.desc))}</p>` }),
    });
  }

  async function viewFashion() {
    const list = await load("fashion");
    const chars = [...new Set(list.map((f) => f.char))].filter((c) => isNaN(+c)).sort();
    textPage({
      crumb: "FASHION", title: S("Fashion & Penampilan", "Fashion & Appearance"),
      desc: S("Kostum dan penampilan Esper beserta deskripsinya.", "Esper outfits and appearances with their descriptions."),
      placeholder: S("Cari kostum atau karakter…", "Search outfits or characters…"),
      list, search: (x) => [tx(x.name), x.name.en, x.char, tx(x.desc)],
      chipDefs: chars.map((c) => ({ v: c, label: c })), chipOf: (x) => x.char,
      card: (x) => ({ k: x.char, t: tx(x.name), p: strip(tx(x.desc)) }),
      open: (x) => ({ name: tx(x.name), kicker: `FASHION · ${x.char}`, body: x.desc ? paras(tx(x.desc)) : "" }),
    });
  }

  async function viewFood() {
    const list = await load("food");
    const kind = { food: S("Makanan", "Food"), material: S("Bahan Masak", "Ingredients") };
    textPage({
      crumb: S("MAKANAN", "FOOD"), title: S("Makanan & Bahan", "Food & Ingredients"),
      desc: S("Makanan, efeknya, dan bahan masak yang ada di game.", "Dishes, their effects, and cooking ingredients in the game."),
      placeholder: S("Cari makanan atau bahan…", "Search food or ingredients…"),
      list, search: (x) => [tx(x.name), x.name.en, tx(x.desc), tx(x.effect)],
      chipDefs: Object.entries(kind).map(([v, label]) => ({ v, label })), chipOf: (x) => x.kind,
      card: (x) => ({ k: kind[x.kind], t: tx(x.name), p: strip(tx(x.effect) || tx(x.desc)) }),
      open: (x) => ({ name: tx(x.name), kicker: kind[x.kind].toUpperCase(), body: `${x.effect ? `<div class="use txt"><b>${S("Efek", "Effect")}:</b> ${rich(tx(x.effect))}</div>` : ""}${x.desc ? paras(tx(x.desc)) : ""}` }),
    });
  }
  syncLangBtn();

  // ---------------- PENCARIAN GLOBAL ----------------
  let index = null;
  async function buildIndex() {
    if (index) return index;
    const [es, ar, md, it, fu, ve, st, an, gl, ac, fa, fo] = await Promise.all(["espers", "arcs", "modules", "items", "furniture", "vehicles", "story", "anomalies", "glossary", "achievements", "fashion", "food"].map(load));
    index = [
      ...es.map((x) => ({ g: "Esper", n: x.name, s: `${x.element} · Rank ${x.rank}`, i: x.icon, href: `/esper/${x.slug}` })),
      ...ar.map((x) => ({ g: "Arc", n: x.name, s: x.type, i: x.icon, href: `/arc/${x.slug}` })),
      ...md.modules.map((x) => ({ g: "Modul", n: x.name, s: x.set || "Modul", i: x.icon, href: `/modul?q=${encodeURIComponent(x.name)}` })),
      ...it.items.map((x) => ({ g: "Item", n: x.name, s: (it.categories.find((c) => c.id === x.cat) || {}).name, i: x.icon, href: `/item?q=${encodeURIComponent(x.name)}` })),
      ...fu.map((x) => ({ g: "Furnitur", n: x.name, s: "Furnitur", i: x.icon, href: `/furnitur?q=${encodeURIComponent(x.name)}` })),
      ...ve.map((x) => ({ g: "Kendaraan", n: x.name, s: x.brand, i: x.icon, href: `/kendaraan?q=${encodeURIComponent(x.name)}` })),
      ...st.map((x) => ({ g: S("Cerita", "Story"), n: tx(x.title), s: x.chapter ? tx(x.chapter) : "Spinoff", href: `/cerita?q=${encodeURIComponent(tx(x.title))}` })),
      ...an.anomalies.map((x) => ({ g: S("Anomali", "Anomaly"), n: x.name, s: x.code, href: `/anomali?q=${encodeURIComponent(x.name)}` })),
      ...gl.map((x) => ({ g: S("Istilah", "Glossary"), n: tx(x.name), s: "", href: `/istilah?q=${encodeURIComponent(x.name.en)}` })),
      ...ac.items.map((x) => ({ g: S("Pencapaian", "Achievement"), n: tx(x.title), s: tx(x.desc), href: `/pencapaian?q=${encodeURIComponent(x.title.en)}` })),
      ...fa.map((x) => ({ g: "Fashion", n: tx(x.name), s: x.char, href: `/fashion?q=${encodeURIComponent(x.name.en)}` })),
      ...fo.map((x) => ({ g: S("Makanan", "Food"), n: tx(x.name), s: "", href: `/makanan?q=${encodeURIComponent(x.name.en)}` })),
    ];
    return index;
  }
  function openSearch() {
    openLayer($("#search"));
    const inp = $("#searchInput");
    inp.value = "";
    $("#searchResults").innerHTML = `<p class="hint">Ketik nama Esper, Arc, item, furnitur, atau kendaraan.</p>`;
    buildIndex();
  }
  $(".search-open").onclick = openSearch;
  let sel = 0;
  $("#searchInput").addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    const box = $("#searchResults");
    if (!q) { box.innerHTML = `<p class="hint">Ketik nama Esper, Arc, item, furnitur, atau kendaraan.</p>`; return; }
    const idx = await buildIndex();
    const hits = idx.filter((x) => x.n.toLowerCase().includes(q)).sort((a, b) => a.n.toLowerCase().indexOf(q) - b.n.toLowerCase().indexOf(q)).slice(0, 40);
    if (!hits.length) { box.innerHTML = `<p class="hint">Tidak ada hasil untuk "${esc(q)}".</p>`; return; }
    const groups = {};
    hits.forEach((h) => (groups[h.g] ||= []).push(h));
    sel = 0;
    box.innerHTML = Object.entries(groups).map(([g, arr]) => `<div class="sr-group mono">${g}</div>` + arr.map((h) => `
      <a class="sr-item" href="${h.href}" data-link>${h.i ? `<img src="${img(h.i)}" alt="">` : `<span style="width:38px"></span>`}<span><b>${esc(h.n)}</b><small>${esc(h.s || "")}</small></span></a>`).join("")).join("");
    markSel();
  });
  function markSel() { $$("#searchResults .sr-item").forEach((a, i) => a.classList.toggle("sel", i === sel)); }
  $("#searchInput").addEventListener("keydown", (e) => {
    const items = $$("#searchResults .sr-item");
    if (!items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % items.length; markSel(); items[sel].scrollIntoView({ block: "nearest" }); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; markSel(); items[sel].scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter") { e.preventDefault(); items[sel].click(); }
  });

  // ---------------- footer: progres terjemahan ----------------
  load("meta").then((m) => {
    const total = (m.translated || 0) + (m.pending || 0);
    if (total) $("#footProgress").textContent = `TERJEMAHAN: ${Math.round(((m.translated || 0) / total) * 100)}% SELESAI`;
  }).catch(() => {});

  render();
})();
