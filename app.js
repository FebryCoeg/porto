// Memuat isi website dari content/data.json lalu menjalankan semua bagian.
// Isi website diedit lewat panel Pages CMS (lihat README) atau langsung di data.json.
(async function () {
  // path gambar dari CMS bisa diawali "/" → jadikan relatif supaya jalan di semua hosting
  const rel = (p) => (typeof p === "string" ? p.replace(/^\/+/, "") : p);

  let data;
  try {
    const res = await fetch("content/data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (e) {
    console.error("Gagal memuat content/data.json", e);
    document.getElementById("top").insertAdjacentHTML(
      "beforeend",
      `<p class="load-error">Isi website gagal dimuat. Kalau kamu membuka file ini langsung dari komputer,
       jalankan lewat server lokal atau hosting (lihat README).</p>`
    );
    return;
  }

  data.foto = rel(data.foto);
  data.logo = rel(data.logo);
  data.qris = rel(data.qris);
  if (data.hero) {
    data.hero.gambar = rel(data.hero.gambar);
    if (data.hero.latar) data.hero.latar.gambar = rel(data.hero.latar.gambar);
  }

  window.CONFIG = data;
  setIntroData(data);
  initSite(data);
  initHero(data);
  initSwarm();
})();
