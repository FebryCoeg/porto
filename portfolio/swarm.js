// ============================================================
//  SWARM REBUILD — versi kawanan kursor
//  Halaman "dikerjakan" secara realtime oleh puluhan kursor:
//  1. sejak halaman dibuka, kursor mengalir dari logo dan mulai bekerja
//  2. tiap kursor mengambil tugas: menarik kotak kartu dari sudut ke sudut
//  3. teks diketik huruf demi huruf, kursor ikut bergerak di ujung ketikan
//  4. kawanan terus bekerja ke bawah mendahului pengunjung, jadi saat di-scroll
//     bagiannya sudah jadi atau sedang diselesaikan. Bagian yang terlihat
//     selalu didahulukan. Yang sudah jadi tidak dibangun ulang.
// ============================================================
window.initSwarm = function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const PIECES = ".section-title, .about-text, .biodata, .social-card, .timeline > li, .game-hint, .game-panel, .yt-dash, .toko-card, .donate-card, .contact > p, .contact-form";
  // elemen yang teksnya diketik huruf demi huruf
  const TYPE = ".section-title, .about-text, .game-hint, .contact > p";
  // elemen teks murni: tidak perlu digambar kotaknya dulu
  const TEXT_ONLY = ".section-title, .game-hint, .contact > p";

  const COLORS = ["#ff8db7", "#8fb4ff", "#ffb02e", "#34d399", "#a78bfa", "#fb7185", "#38bdf8", "#f472b6", "#facc15", "#4ade80", "#c084fc", "#60a5fa"];

  const mobile = () => innerWidth < 760;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

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

  // ---------- pecah teks jadi huruf (tanpa mengubah tata letak) ----------
  function splitChars(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    const chars = [];
    nodes.forEach((n) => {
      const wrap = document.createElement("sw-t"); // tag khusus: tidak ikut gaya span
      for (const c of n.nodeValue) {
        const s = document.createElement("sw-c");
        s.textContent = c;
        wrap.appendChild(s);
        if (c.trim()) chars.push(s);
      }
      n.replaceWith(wrap);
    });
    return chars;
  }

  // ---------- data tiap bagian ----------
  const sections = [...document.querySelectorAll("main .section")];
  const states = new Map();
  sections.forEach((sec) => {
    const pieces = [...sec.querySelectorAll(PIECES)].map((el) => {
      el.classList.add("swarm-piece");
      const type = el.matches(TYPE);
      if (type) el.classList.add("sw-type");
      return { el, type, box: !el.matches(TEXT_ONLY), chars: type ? splitChars(el) : [] };
    });
    states.set(sec, { phase: "idle", pieces });
  });

  // ---------- kolam kursor (dipakai bergantian oleh semua bagian) ----------
  const cursors = [];
  function origin() {
    const b = document.getElementById("brand") || document.querySelector(".nav .brand");
    const r = b && b.getBoundingClientRect();
    return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 40, y: 30 };
  }
  function getCursor(i) {
    if (!cursors[i]) {
      const o = origin();
      cursors[i] = {
        x: o.x + rand(-6, 6), y: o.y + rand(-6, 6), alpha: 0,
        color: COLORS[i % COLORS.length], scale: rand(0.72, 0.95),
        queue: [], job: null, idleSince: performance.now(), wob: rand(0, 1000),
      };
    }
    return cursors[i];
  }

  // ---------- mulai membangun satu bagian ----------
  function build(sec) {
    const st = states.get(sec);
    const pieces = st.pieces.filter((p) => p.el.getBoundingClientRect().width > 0);
    st.pieces.forEach((p) => (pieces.includes(p) ? hidePiece(p) : completePiece(p)));
    st.phase = "building";
    st.t0 = performance.now();
    st.total = pieces.length;
    st.done = 0;
    if (!pieces.length) { st.phase = "done"; return; }

    const n = Math.min(pieces.length + 1, mobile() ? 5 : 9);
    // tugas dibagi bergiliran; kursor yang sedang sibuk tetap menyelesaikan tugas lamanya dulu
    const team = [];
    for (let k = 0; team.length < n && k < 40; k++) {
      const c = getCursor(k);
      if (!c.job && !c.queue.length) team.push(c);
    }
    if (!team.length) team.push(getCursor(0));
    pieces.forEach((p, i) => team[i % team.length].queue.push({ sec, st, p, delay: Math.floor(i / team.length) === 0 ? (i % team.length) * 0.18 : rand(0.25, 0.5) }));

    // cadangan: semua konten pasti tampil walau animasi tertahan (tab di background, dll.)
    clearTimeout(st.timer);
    st.timer = setTimeout(() => finishSection(sec), 25000);
    loop();
  }

  function hidePiece(p) {
    p.el.classList.remove("sw-show", "sw-typed");
    p.chars.forEach((c) => c.classList.remove("on"));
    p.status = "wait";
  }
  function showPiece(p) {
    p.el.classList.add("sw-show");
  }
  function completePiece(p) {
    if (p.status === "done") return;
    p.status = "done";
    showPiece(p);
    if (p.type) p.el.classList.add("sw-typed");
  }
  function finishSection(sec) {
    const st = states.get(sec);
    if (st.phase === "idle") return;
    st.pieces.forEach(completePiece);
    st.phase = "done";
    cursors.forEach((c) => {
      c.queue = c.queue.filter((j) => j.sec !== sec);
      if (c.job && c.job.sec === sec) c.job = null;
    });
  }
  // ---------- penjadwal: kerjakan berurutan ke bawah, yang terlihat didahulukan ----------
  const visible = new Set();
  const visObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    schedule();
  }, { rootMargin: "0px 0px 10% 0px" });
  sections.forEach((s) => visObs.observe(s));

  function schedule() {
    // tunggu layar "Selamat Datang" selesai supaya pengunjung melihat kursornya bekerja
    if (document.documentElement.classList.contains("intro-active")) return;
    sections.forEach((s) => { if (visible.has(s) && states.get(s).phase === "idle") build(s); });
    // bagian yang terlihat dikerjakan dulu; setelah semuanya beres,
    // kawanan mencicil satu bagian di bawahnya supaya sudah siap saat di-scroll
    const busy = sections.some((s) => states.get(s).phase === "building");
    if (busy) return;
    const next = sections.find((s) => states.get(s).phase === "idle");
    if (next) build(next);
  }
  setTimeout(schedule, 350);
  const tick = setInterval(() => {
    schedule();
    if (sections.every((s) => states.get(s).phase === "done")) clearInterval(tick);
  }, 400);

  // ---------- jalannya tiap tugas ----------
  function startJob(c, now) {
    const job = c.queue.shift();
    if (!job) return;
    if (job.st.phase !== "building" || job.p.status === "done") return startJob(c, now);
    const r = job.p.el.getBoundingClientRect();
    job.stage = "fly";
    job.t = now + job.delay * 1000;
    job.fx = c.x; job.fy = c.y;
    job.bend = rand(-0.35, 0.35);
    const dist = Math.hypot(r.left - c.x, r.top - c.y);
    job.flyDur = Math.min(1.4, 0.65 + dist / 1400);
    job.p.status = "busy";
    c.job = job;
  }

  // titik tujuan terkini (ikut bergeser saat halaman di-scroll)
  function target(job) {
    const r = job.p.el.getBoundingClientRect();
    if (!job.p.box && job.p.chars.length) {
      const f = job.p.chars[0].getBoundingClientRect();
      return { x: f.left, y: f.top + f.height * 0.6, r };
    }
    return { x: r.left, y: r.top, r };
  }

  function step(c, now, dt) {
    if (!c.job) startJob(c, now);
    const job = c.job;
    if (!job) {
      // menganggur: melayang pelan lalu memudar
      c.x += Math.sin(now / 700 + c.wob) * 0.25;
      c.y += Math.cos(now / 900 + c.wob) * 0.25 - 0.15;
      if (now - c.idleSince > 900) c.alpha = Math.max(0, c.alpha - dt * 1.6);
      return false;
    }
    c.idleSince = now;
    c.alpha = Math.min(1, c.alpha + dt * 4);
    const t = (now - job.t) / 1000;
    if (t < 0) return true;
    const tg = target(job);

    if (job.stage === "fly") {
      const u = easeIO(clamp01(t / job.flyDur));
      const dx = tg.x - job.fx, dy = tg.y - job.fy, len = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(u * Math.PI) * job.bend * len;
      c.x = job.fx + dx * u - (dy / len) * arc;
      c.y = job.fy + dy * u + (dx / len) * arc;
      if (u >= 1) {
        job.stage = job.p.box ? "draw" : "type";
        job.t = now;
        job.drawDur = Math.min(1.5, 0.8 + (tg.r.width + tg.r.height) / 1800);
        if (!job.p.box) { showPiece(job.p); job.typed = 0; }
      }
    } else if (job.stage === "draw") {
      const u = easeOut(clamp01(t / job.drawDur));
      job.prog = u;
      c.x = tg.r.left + tg.r.width * u;
      c.y = tg.r.top + tg.r.height * u;
      if (u >= 1) {
        showPiece(job.p);
        job.drawnAt = now;
        job.p.drawnAt = now;
        job.p.rect = true;
        if (job.p.type && job.p.chars.length) { job.stage = "type"; job.t = now; job.typed = 0; }
        else return endJob(c, now);
      }
    } else if (job.stage === "type") {
      const chars = job.p.chars;
      // kecepatan mengetik menyesuaikan panjang teks (maks ±1,4 detik per elemen)
      const cps = Math.max(26, chars.length / 3.2); // ±26 huruf/detik, maks ±3 detik per elemen
      const want = Math.min(chars.length, Math.floor(t * cps));
      while (job.typed < want) chars[job.typed++].classList.add("on");
      const last = chars[Math.max(0, job.typed - 1)];
      if (last) {
        const lr = last.getBoundingClientRect();
        c.x += (lr.right + 2 - c.x) * 0.6;
        c.y += (lr.top + lr.height * 0.7 - c.y) * 0.6;
      }
      if (job.typed >= chars.length) return endJob(c, now);
    }
    return true;
  }

  function endJob(c, now) {
    const st = c.job.st;
    completePiece(c.job.p);
    st.done++;
    if (st.done >= st.total) { st.phase = "done"; clearTimeout(st.timer); st.doneAt = now; }
    c.job = null;
    c.idleSince = now;
    return true;
  }

  // ---------- menggambar ----------
  function drawCursor(c) {
    if (c.alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    // panah kursor
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.6, 12.8); ctx.lineTo(8, 19.6);
    ctx.lineTo(10.8, 18.4); ctx.lineTo(7.5, 11.8); ctx.lineTo(13.2, 11.8); ctx.closePath();
    ctx.fillStyle = c.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.stroke();
    ctx.restore();
  }

  function drawBox(x, y, w, h, color, alpha, rad) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(rad, w / 2, h / 2)); else ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.07;
    ctx.fill();
    // titik pegangan di sudut, seperti alat seleksi di aplikasi desain
    ctx.globalAlpha = alpha;
    ctx.setLineDash([]);
    ctx.fillStyle = "#fff";
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([px, py]) => {
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.strokeRect(px - 3, py - 3, 6, 6);
    });
    ctx.restore();
  }

  let running = false, last = 0;
  function loop() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let active = false;

    // kotak yang sedang ditarik & yang baru selesai (memudar)
    cursors.forEach((c) => {
      const j = c.job;
      if (j && j.stage === "draw" && j.prog) {
        const r = j.p.el.getBoundingClientRect();
        const rad = parseFloat(getComputedStyle(j.p.el).borderTopLeftRadius) || 0;
        drawBox(r.left, r.top, r.width * j.prog, r.height * j.prog, c.color, c.alpha, rad);
      }
    });
    states.forEach((st) => st.pieces.forEach((p) => {
      if (!p.rect) return;
      const a = 1 - clamp01((now - p.drawnAt) / 450);
      if (a <= 0) { p.rect = false; return; }
      active = true;
      const r = p.el.getBoundingClientRect();
      drawBox(r.left, r.top, r.width, r.height, "#ffffff", a * 0.8, parseFloat(getComputedStyle(p.el).borderTopLeftRadius) || 0);
    }));

    cursors.forEach((c) => { if (step(c, now, dt)) active = true; if (c.alpha > 0.01) active = true; drawCursor(c); });

    if (active) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
};
