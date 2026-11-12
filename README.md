# febrycoeg.my.id

Website milik **Febri Riansyah (Febry Coeg)**: content creator, gamer, pembuat guide game, dan pemilik toko top up **Febry Store**.

Isinya ada dua:

- 🗂️ **Arsip Hethereau** di **https://febrycoeg.my.id**, database fan-made game *Neverness to Everness* (NTE) berbahasa Indonesia.
- 👤 **Portofolio** di **https://febrycoeg.my.id/portfolio/**, profil Febry lengkap dengan sosial media, pencapaian, game, video YouTube, dan kontak. Bisa dibuka juga lewat menu di Arsip Hethereau.

---

## Arsip Hethereau (Database NTE)

Database seluruh isi game NTE, disusun rapi per kategori dengan tampilan yang mengikuti UI di dalam game: latar arang halftone, tombol pil krem bergaris tebal, dan aksen magenta.

| Kategori | Isi |
|---|---|
| **Esper** | 26 karakter lengkap dengan rank, elemen, tipe, skill (Basic, Reflexive, Redirect, Ultimate, Support, Passive), Awakening, Console, profil, kutipan, dan arsip cerita. |
| **Arc** | 53 senjata/Fork dengan efek yang nilainya berubah sesuai bintang (1 sampai 5) yang dipilih. |
| **Modul** | Modul beserta set bonusnya (efek 2 dan 4 bagian). |
| **Item** | 1.500+ item yang dikelompokkan ke 11 kategori: material, karakter, hadiah, masakan, profil, koleksi, kostum, paket, item penting, item misi, dan lainnya. |
| **Furnitur** | 300+ furnitur dengan nilai Kenyamanan dan Koleksi. |
| **Kendaraan & Properti** | Semua kendaraan dan rumah yang bisa dimiliki di Hethereau. |
| **Cerita** | Ringkasan resmi setiap bab cerita utama dan spinoff, lengkap dengan gambar sampul bab dari menu Plot Review. |
| **Anomali & Monster** | Arsip Anomaly dengan foto arsip, kelas, kode, kutipan, kisah, karakteristik, dan Nexus, ditambah monster dan boss beserta ikonnya. |
| **Istilah** | Arti istilah dunia NTE dari buku panduan dalam game. |
| **Pencapaian** | 450+ achievement per kategori, lengkap dengan medali perunggu/perak/emas, syarat, dan hadiahnya. |
| **Fashion & Makanan** | Kostum setiap Esper beserta deskripsinya, serta makanan dan bahan masak beserta ikon dan efeknya. |

- **Berbahasa Indonesia**: efek, deskripsi, dan cerita diterjemahkan ke bahasa Indonesia. Nama karakter, item, skill, dan istilah game tetap memakai nama aslinya.
- **Dua bahasa**: tombol ID/EN untuk beralih ke teks bahasa Inggris aslinya.
- **Pencarian cepat** ke seluruh isi database (tekan `Ctrl + K` atau `/`).
- **Filter** per rarity, elemen, tipe, dan kategori yang tersimpan di URL, jadi hasil filter bisa langsung dibagikan.
- **Tampilan responsif** untuk laptop maupun HP.
- **Data dan gambar langsung dari file game**: teks, tabel data, ikon, dan aset UI, diolah dengan skrip Python menjadi JSON dan gambar WebP.
- **Pemberitahuan update otomatis**: setiap Senin, GitHub Action membandingkan data yang dipakai website dengan versi terbaru NTE_Assets. Kalau ada yang berubah, terbuka Issue berisi versi baru dan daftar file yang berubah.

---

## Portofolio

| Bagian | Fungsi |
|---|---|
| **Layar Sambutan** | Animasi "Selamat Datang" dengan logo COEG saat halaman pertama kali dibuka. |
| **Landing Page** | Halaman pembuka dengan ilustrasi beranimasi (parallax, rambut tertiup angin, kelopak sakura), judul besar, kartu pintasan, dan tumpukan platform donasi. |
| **Tentang Aku** | Perkenalan singkat dan biodata umum. |
| **Sosial Media** | Kumpulan akun Instagram, TikTok, YouTube, X, Discord, dan lainnya dalam bentuk kartu yang bisa diklik. |
| **Pencapaian** | Timeline perjalanan, dari komunitas wibu, channel YouTube, hingga Creator Official Tower of Fantasy, Neverness to Everness, dan Silver Palace, lengkap dengan gambar. |
| **Game yang Dimainkan** | Panel-panel game yang melebar saat disorot, menampilkan gambar game beserta data akun seperti UID (bisa disalin), level, dan server. |
| **Dasbor YouTube** | Info channel (subscriber, jumlah video) dan video terbaru yang berjajar, bisa diputar langsung di jendela pop-up. Daftarnya diperbarui otomatis. |
| **Toko Top Up** | Profil **Febry Store**: top up 50+ game dengan 1000+ produk, keunggulan toko, dan tombol menuju toko. |
| **Dukung Aku** | Link donasi ke Sociabuzz, Trakteer, dan Saweria. |
| **Kontak** | Form pesan yang langsung membuka Gmail pengunjung dengan pesan yang sudah terisi. |

## Fitur

- **Tema gelap & terang** dengan palet pink sakura dan biru es yang menyatu dari atas sampai bawah.
- **Animasi "Swarm Rebuild"**: halaman dikerjakan secara live oleh kawanan kursor yang menarik kotak tiap kartu dan mengetik teksnya huruf demi huruf, mendahului pengunjung saat di-scroll.
- **Video selalu terbaru**: GitHub Action mengambil daftar video terbaru dari channel YouTube setiap 6 jam, tanpa API key.
- **Pratinjau link yang menarik**: saat link dibagikan di WhatsApp, Discord, X, dan lainnya, muncul kartu bergambar lengkap dengan judul dan deskripsi.
- **Logo beranimasi**: logo COEG melayang, memantul, dan berkilau terus-menerus.
- **Ikon buatan sendiri**: semua ikon digambar khusus dengan gaya yang seragam.
- **Responsif**: tampil rapi di laptop maupun HP.
- **Ramah aksesibilitas**: animasi otomatis dikurangi bagi pengunjung yang mengaktifkan "kurangi gerakan".
- **Mudah diperbarui**: seluruh isi (teks, gambar, link) disimpan di `portfolio/content/data.json` dan bisa diedit lewat panel [Pages CMS](https://pagescms.org) tanpa menyentuh kode.

## Teknologi

HTML, CSS, dan JavaScript murni tanpa framework · Python untuk mengolah data NTE · WebGL untuk ilustrasi landing page · Canvas untuk animasi kawanan kursor · Python + GitHub Actions untuk pembaruan video otomatis · Di-hosting gratis dengan GitHub Pages.

## Kredit

- Data dan gambar Arsip Hethereau: Neverness to Everness © Hotta Studio / Perfect World, diambil dari Waifus-Grace/NTE_Assets. Arsip ini adalah proyek penggemar dan tidak berafiliasi dengan pengembang game.
- Ilustrasi landing page: Kamisato Ayaka, Genshin Impact © HoYoverse
- Gambar pencapaian: Sword Art Online © Reki Kawahara/KADOKAWA/SAO Project · Tower of Fantasy © Hotta Studio, a Perfect World Company · Neverness to Everness © Hotta Studio / Perfect World · Silver Palace © Elementa / Silver Studio · Aniimo © Pawprints Studio · Ananta © NetEase Games / Naked Rain
- Nama dan logo platform (Sociabuzz, Trakteer, Saweria, dan media sosial) adalah milik pemiliknya masing-masing.
