"""Ambil info channel + video terbaru dari halaman YouTube, simpan ke portfolio/content/youtube.json.

Dipakai oleh GitHub Action (.github/workflows/youtube.yml) agar daftar video di website
selalu terbaru tanpa perlu API key. Kalau gagal, file lama tidak diubah.
"""
import json, re, sys, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "portfolio" / "content" / "youtube.json"
cfg = json.loads((ROOT / "portfolio" / "content" / "data.json").read_text(encoding="utf-8")).get("youtube") or {}
HANDLE = (cfg.get("handle") or "@FebryCoeg").strip()
if not HANDLE.startswith("@"):
    HANDLE = "@" + HANDLE
JUMLAH = int(cfg.get("jumlah") or 12)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Cookie": "CONSENT=YES+cb; SOCS=CAI",
}


def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def find(o, key, out=None):
    out = [] if out is None else out
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key:
                out.append(v)
            else:
                find(v, key, out)
    elif isinstance(o, list):
        for v in o:
            find(v, key, out)
    return out


def text(o):
    return (o or {}).get("content") or (o or {}).get("simpleText") or ""


UNITS = {"detik": "seconds", "menit": "minutes", "jam": "hours", "hari": "days", "minggu": "weeks", "bulan": "months", "tahun": "years",
         "second": "seconds", "minute": "minutes", "hour": "hours", "day": "days", "week": "weeks", "month": "months", "year": "years"}


def kira_tanggal(rel, now):
    """'2 weeks ago' -> perkiraan tanggal ISO (dihitung ulang jadi 'x ago' di browser)."""
    m = re.search(r"(\d+)\s*(detik|menit|jam|hari|minggu|bulan|tahun|second|minute|hour|day|week|month|year)", rel or "")
    if not m:
        return now.isoformat(timespec="seconds")
    n, u = int(m.group(1)), UNITS[m.group(2)]
    if u == "months":
        delta = timedelta(days=30 * n)
    elif u == "years":
        delta = timedelta(days=365 * n)
    else:
        delta = timedelta(**{u: n})
    return (now - delta).isoformat(timespec="seconds")


def main():
    m = None
    for _ in range(4):  # YouTube kadang mengirim halaman tanpa data, coba ulang
        html = fetch(f"https://www.youtube.com/{HANDLE}/videos?hl=en&gl=US")
        m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
        if m:
            break
    if not m:
        sys.exit("ytInitialData tidak ditemukan, data lama dipertahankan.")
    data = json.loads(m.group(1))
    now = datetime.now(timezone.utc)

    head = (find(data, "pageHeaderViewModel") or [{}])[0]
    rows = find(head.get("metadata"), "metadataParts")
    parts = [text(p.get("text")) for row in rows for p in row]
    sub = next((p for p in parts if "subscriber" in p.lower()), "")
    vid = next((p for p in parts if re.search(r"\bvideos?\b", p.lower())), "")
    avatar = find(head.get("image"), "sources")
    banner = find(head.get("banner"), "sources")
    channel = {
        "nama": text(find(head.get("title"), "text")[0]) if find(head.get("title"), "text") else "",
        "handle": HANDLE,
        "url": f"https://www.youtube.com/{HANDLE}",
        "avatar": avatar[0][-1]["url"] if avatar and avatar[0] else "",
        "banner": banner[0][-1]["url"] if banner and banner[0] else "",
        "subscriber": re.sub(r"\s*subscriber.*", "", sub, flags=re.I).replace(" ", " ").strip(),
        "video": re.sub(r"\s*video.*", "", vid, flags=re.I).replace(" ", " ").strip(),
    }

    videos = []
    for v in find(data, "lockupViewModel"):
        if v.get("contentType") != "LOCKUP_CONTENT_TYPE_VIDEO" or not v.get("contentId"):
            continue
        md = (v.get("metadata") or {}).get("lockupMetadataViewModel") or {}
        mparts = [p for row in find(md.get("metadata"), "metadataParts") for p in row]
        views = next((text(p.get("text")) for p in mparts if "ditonton" in (p.get("accessibilityLabel") or "") or "view" in (p.get("accessibilityLabel") or "").lower()), "")
        # pakai label aksesibilitas ("1 hari yang lalu"), teks tampilannya disingkat ("1 h lalu")
        rel = next((p.get("accessibilityLabel") or text(p.get("text")) for p in mparts if re.search(r"lalu|ago", text(p.get("text")))), "")
        badge = find(v.get("contentImage"), "thumbnailBadgeViewModel")
        videos.append({
            "id": v["contentId"],
            "judul": text(md.get("title")),
            "ditonton": views.replace(" ", " "),
            "durasi": badge[0].get("text", "") if badge else "",
            "tanggal": kira_tanggal(rel, now),
        })
        if len(videos) >= JUMLAH:
            break

    if not videos:
        sys.exit("Tidak ada video terbaca, data lama dipertahankan.")

    out = {"diperbarui": now.isoformat(timespec="seconds"), "channel": channel, "video": videos}
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    # tanggal perkiraan: pertahankan yang lama untuk video yang sudah tercatat (lebih akurat)
    lama = {x["id"]: x.get("tanggal") for x in old.get("video", [])}
    for x in videos:
        if lama.get(x["id"]):
            x["tanggal"] = lama[x["id"]]
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {channel['nama']} | {channel['subscriber']} subscriber | {len(videos)} video")


if __name__ == "__main__":
    main()
