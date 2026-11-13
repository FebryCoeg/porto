// Memuat isi website dari content/data.json lalu menjalankan semua bagian.
// Isi website diedit lewat panel Pages CMS (lihat README) atau langsung di data.json.
(async function () {
  // path gambar dari CMS bisa diawali "/" → jadikan relatif supaya jalan di semua hosting
  const rel = (p) => (typeof p === "string" ? p.replace(/^\/+(?:portfolio\/)?/, "") : p);

  // daftar video YouTube (diperbarui otomatis oleh GitHub Action), dimuat bersamaan
  const ytReq = fetch("content/youtube.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  let data;
  try {
    const res = await fetch("content/data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (e) {
    console.error("Gagal memuat content/data.json", e);
    document.getElementById("top").insertAdjacentHTML(
      "beforeend",
      `<p class="load-error">The site content failed to load. If you opened this file directly from your computer,
       please run it through a local server or a web host.</p>`
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

  data.youtubeData = await ytReq;

  window.CONFIG = data;
  setIntroData(data);
  initSite(data);
  initHero(data);
  initSwarm();
})();
