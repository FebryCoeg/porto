// ============================================================
//  SWARM REBUILD — setiap bagian "dibangun" saat di-scroll:
//  1. segerombolan partikel terbang dari sisi layar
//  2. partikel menyusun kerangka (wireframe) tiap kartu/judul
//  3. konten asli muncul dari kerangka itu
//  4. partikel bubar. Keluar layar lalu kembali = dibangun ulang.
// ============================================================
window.initSwarm = function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const PIECES = ".section-title, .about-text, .biodata, .social-card, .timeline > li, .toko-card, .donate-card, .contact > p, .contact-form";
  const T = { fly: 0.36, arrive: 0.95, wireIn: 0.5, built: 0.9, scatter: 1.3, end: 2.0 }; // detik

  document.documentElement.classList.add("swarm-on");
  const canvas = document.createElement("canvas");
  canvas.className = "swarm-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let dpr = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  resize();
  addEventListener("resize", resize);

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const sections = [...document.querySelectorAll("main .section")];
  const states = new Map();
  sections.forEach((sec) => {
    const pieces = [...sec.querySelectorAll(PIECES)];
    pieces.forEach((p, i) => { p.classList.add("swarm-piece"); p.style.setProperty("--d", (i * 0.06).toFixed(2) + "s"); });
    states.set(sec, { phase: "idle", pieces });
  });

  function build(sec) {
    const st = states.get(sec);
    const sr = sec.getBoundingClientRect();
    const mobile = innerWidth < 760;
    const step = mobile ? 18 : 13;
    const maxP = mobile ? 380 : 760;
    const rects = [];
    let pts = [];

    st.pieces.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = r.left - sr.left, y = r.top - sr.top, w = r.width, h = r.height;
      const rad = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      rects.push({ x, y, w, h, rad, i });
      for (let a = 0; a <= w; a += step) { pts.push({ x: x + a, y, i }); pts.push({ x: x + a, y: y + h, i }); }
      for (let b = step; b < h; b += step) { pts.push({ x, y: y + b, i }); pts.push({ x: x + w, y: y + b, i }); }
    });
    if (pts.length > maxP) { const k = pts.length / maxP; pts = Array.from({ length: maxP }, (_, j) => pts[Math.floor(j * k)]); }

    const n = Math.max(1, st.pieces.length);
    const fromLeft = Math.random() < 0.5;
    const ox = fromLeft ? -60 : innerWidth + 60;
    const oy = innerHeight * rand(0.25, 0.75);

    st.particles = pts.map((p) => {
      const sx = ox + rand(-90, 90), sy = oy + rand(-140, 140);
      const tx = sr.left + p.x, ty = sr.top + p.y;
      // titik kontrol melengkung = jalur "berkerumun"
      const mx = (sx + tx) / 2, my = (sy + ty) / 2;
      const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1;
      const bend = rand(-0.45, 0.45) * len;
      return {
        tx: p.x, ty: p.y, sx, sy,
        cx: mx - (dy / len) * bend, cy: my + (dx / len) * bend,
        delay: (p.i / n) * T.fly + rand(0, 0.14),
        dur: rand(0.55, 0.8),
        size: rand(1.6, 3.2),
        seed: rand(0, 1000),
        ang: rand(0, Math.PI * 2), dist: rand(20, 70),
      };
    });

    const cs = getComputedStyle(document.documentElement);
    st.color = cs.getPropertyValue("--accent").trim() || "#7c3aed";
    st.color2 = cs.getPropertyValue("--accent-2").trim() || "#ec4899";
    st.rects = rects;
    st.label = (sec.id || "section").toUpperCase();
    st.t0 = performance.now();
    st.phase = "building";
    st.builtFlag = false;
    sec.classList.remove("built");
    // cadangan: konten pasti muncul walau animasi frame tertahan (mis. tab di background)
    clearTimeout(st.timer);
    st.timer = setTimeout(() => { if (st.phase !== "idle") { st.builtFlag = true; sec.classList.add("built"); } }, T.built * 1000 + 60);
    loop();
  }

  function reset(sec) {
    const st = states.get(sec);
    clearTimeout(st.timer);
    st.phase = "idle";
    st.particles = null;
    sec.classList.remove("built");
  }

  // masuk layar → bangun; keluar layar sepenuhnya → siap dibangun ulang
  const enterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && states.get(e.target).phase === "idle") build(e.target); });
  }, { rootMargin: "0px 0px -18% 0px" });
  const exitObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (!e.isIntersecting) reset(e.target); });
  });
  sections.forEach((s) => { enterObs.observe(s); exitObs.observe(s); });

  let running = false;
  function loop() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function frame(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let active = false;

    states.forEach((st, sec) => {
      if (st.phase !== "building") return;
      const t = (now - st.t0) / 1000;
      if (t > T.end) { st.phase = "done"; st.particles = null; return; }
      active = true;
      const sr = sec.getBoundingClientRect();

      if (!st.builtFlag && t >= T.built) { st.builtFlag = true; sec.classList.add("built"); }

      // kerangka (wireframe) bergaris putus-putus
      const wa = clamp01((t - T.wireIn) / 0.35) * (1 - clamp01((t - T.scatter) / 0.5));
      if (wa > 0) {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -t * 40;
        ctx.strokeStyle = st.color;
        ctx.globalAlpha = wa * 0.75;
        st.rects.forEach((r) => {
          const x = sr.left + r.x, y = sr.top + r.y;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, r.w, r.h, r.rad); else ctx.rect(x, y, r.w, r.h);
          ctx.stroke();
        });
        // tanda sudut ala blueprint
        ctx.setLineDash([]);
        ctx.globalAlpha = wa;
        ctx.strokeStyle = st.color2;
        st.rects.forEach((r) => {
          const x = sr.left + r.x, y = sr.top + r.y, c = 7;
          ctx.beginPath();
          [[x, y, 1, 1], [x + r.w, y, -1, 1], [x, y + r.h, 1, -1], [x + r.w, y + r.h, -1, -1]].forEach(([px, py, a, b]) => {
            ctx.moveTo(px + a * c, py); ctx.lineTo(px, py); ctx.lineTo(px, py + b * c);
          });
          ctx.stroke();
        });
        ctx.restore();
      }

      // partikel
      const scatter = clamp01((t - T.scatter) / (T.end - T.scatter));
      ctx.save();
      st.particles.forEach((p, k) => {
        const u = ease(clamp01((t - p.delay) / p.dur));
        if (t < p.delay) return;
        const tx = sr.left + p.tx, ty = sr.top + p.ty;
        const iu = 1 - u;
        let x = iu * iu * p.sx + 2 * iu * u * p.cx + u * u * tx;
        let y = iu * iu * p.sy + 2 * iu * u * p.cy + u * u * ty;
        // getaran kerumunan saat terbang
        x += Math.sin(t * 7 + p.seed) * 7 * iu;
        y += Math.cos(t * 6 + p.seed) * 7 * iu;
        if (scatter > 0) {
          const e = scatter * scatter;
          x += Math.cos(p.ang) * p.dist * e;
          y += Math.sin(p.ang) * p.dist * e - 20 * e;
        }
        const arrived = u >= 1;
        const flicker = arrived ? 0.6 + 0.4 * Math.sin(t * 20 + p.seed) : 1;
        ctx.globalAlpha = (1 - scatter) * flicker;
        ctx.fillStyle = k % 3 === 0 ? st.color2 : st.color;
        const s = p.size * (arrived ? 1.25 : 1);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      });
      ctx.restore();

      // label status "sedang dibangun"
      const pct = Math.round(clamp01(t / T.built) * 100);
      const la = 1 - clamp01((t - T.scatter) / 0.4);
      if (la > 0) {
        ctx.save();
        ctx.globalAlpha = la;
        ctx.font = "600 11px ui-monospace, SFMono-Regular, Consolas, monospace";
        ctx.fillStyle = st.color;
        const lx = Math.max(16, sr.left + (st.rects[0] ? st.rects[0].x : 0));
        const ly = sr.top + (st.rects[0] ? st.rects[0].y : 0) - 12;
        const dots = ".".repeat(1 + (Math.floor(t * 6) % 3));
        ctx.fillText(pct < 100 ? `▸ rebuilding <${st.label}> ${pct}%${dots}` : `✓ <${st.label}> built`, lx, ly);
        ctx.restore();
      }
    });

    if (active) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
};
