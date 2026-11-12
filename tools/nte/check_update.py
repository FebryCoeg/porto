"""Cek apakah NTE_Assets punya data yang lebih baru daripada yang dipakai website.

Membandingkan file-file yang benar-benar dipakai build (tools/nte/sources.json)
antara commit yang dipakai website dan main terbaru, lalu menulis ringkasannya
ke file Markdown.

  python tools/nte/check_update.py <keluaran.md>

Di GitHub Actions hasilnya juga ditulis ke $GITHUB_OUTPUT: changed, head, title.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = "Waifus-Grace/NTE_Assets"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def api(path):
    headers = {"User-Agent": "nte-db-check", "Accept": "application/vnd.github+json"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/{path}", headers=headers)
    # daftar file repo ini besar (±10 MB), GitHub kadang membalas 500 saat pertama kali menyusunnya
    for attempt in range(4):
        try:
            return json.loads(urllib.request.urlopen(req, timeout=120).read())
        except urllib.error.HTTPError as e:
            if e.code < 500 or attempt == 3:
                raise
        except urllib.error.URLError:
            if attempt == 3:
                raise
        time.sleep(10 * (attempt + 1))


def tree(sha):
    d = api(f"git/trees/{sha}?recursive=1")
    if d.get("truncated"):
        raise SystemExit("Daftar file NTE_Assets terpotong oleh GitHub, perbandingan tidak bisa dipercaya.")
    return {x["path"]: x["sha"] for x in d["tree"] if x["type"] == "blob"}


def output(**kv):
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            for k, v in kv.items():
                f.write(f"{k}={v}\n")


def diff(paths, old, new):
    changed = {}
    for p in paths:
        if p not in new:
            changed[p] = "dihapus"
        elif p not in old:
            changed[p] = "muncul kembali"
        elif old[p] != new[p]:
            changed[p] = "diubah"
    return changed


def section(lines, title, changed, limit=20):
    if not changed:
        return
    lines += ["", f"**{title}**: {len(changed)} file", ""]
    for p, how in list(changed.items())[:limit]:
        lines.append(f"- `{p}` ({how})")
    if len(changed) > limit:
        lines.append(f"- …dan {len(changed) - limit} file lainnya")


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "nte-update.md")
    meta = json.loads((ROOT / "nte" / "data" / "meta.json").read_text(encoding="utf-8"))
    sources = json.loads((ROOT / "tools" / "nte" / "sources.json").read_text(encoding="utf-8"))
    base, base_ver = meta["sourceCommit"], meta.get("sourceVersion", "?")

    head = api("commits/main")
    head_sha = head["sha"]
    head_ver = head["commit"]["message"].splitlines()[0].strip()
    if head_sha == base:
        print(f"Data masih terbaru (versi {base_ver}).")
        output(changed="false")
        return

    old, new = tree(base), tree(head_sha)
    data = diff(sources["data"], old, new)
    images = diff(sources["images"], old, new)
    # file data baru di folder yang sama dengan yang dipakai = kemungkinan konten baru (Esper, item, dll.)
    folders = {p.rsplit("/", 1)[0] for p in sources["data"] if "/" in p}
    added = {p: "baru" for p in new if p not in old and p.endswith(".json")
             and p.rsplit("/", 1)[0] in folders}

    if not (data or images or added):
        print(f"Ada versi baru ({head_ver}), tapi file yang dipakai website tidak berubah.")
        output(changed="false")
        return

    title = f"Update data NTE: {base_ver} → {head_ver}"
    lines = [
        f"<!-- head:{head_sha} -->",
        "NTE_Assets punya data yang lebih baru daripada yang dipakai Arsip Hethereau.",
        "",
        f"- **Versi di website:** {base_ver} (`{base[:7]}`)",
        f"- **Versi terbaru:** {head_ver} (`{head_sha[:7]}`, {head['commit']['committer']['date'][:10]})",
        f"- **Perbandingan lengkap:** https://github.com/{REPO}/compare/{base[:12]}...{head_sha[:12]}",
        "",
        "### Yang berubah",
    ]
    section(lines, "Data & teks yang dipakai website", data)
    section(lines, "File data baru (kemungkinan konten baru)", added)
    section(lines, "Gambar yang dipakai website", {f"{p} → {sources['images'][p]}": h for p, h in images.items()})
    lines += [
        "",
        "---",
        "Untuk memperbarui: minta Claude \"update data NTE\". Data diambil ulang, teks yang baru "
        "diterjemahkan, lalu dicek sebelum di-push. Issue ini ditutup setelah update selesai.",
    ]
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(title)
    print(f"data {len(data)}, file baru {len(added)}, gambar {len(images)}; ringkasan di {out}")
    output(changed="true", head=head_sha, title=title)


if __name__ == "__main__":
    main()
