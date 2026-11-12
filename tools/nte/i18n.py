"""Alat bantu terjemahan database NTE.

  python tools/nte/i18n.py batch [jumlah] [awalan-konteks]   -> tampilkan teks yang belum diterjemahkan
  python tools/nte/i18n.py apply <file.json>                  -> gabungkan terjemahan {id: teks} ke i18n_id.json
  python tools/nte/i18n.py stats                              -> ringkasan progres per konteks

ID = 10 karakter pertama md5 dari teks Inggris, jadi tetap sama walau build diulang.
"""
import hashlib
import json
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PEND = TOOLS / "untranslated.json"
PEND_EXTRA = TOOLS / "untranslated_extra.json"
I18N = TOOLS / "i18n_id.json"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

hid = lambda s: hashlib.md5(s.encode("utf-8")).hexdigest()[:10]


def load():
    pend = []
    for f in (PEND, PEND_EXTRA):  # data utama (build.py) + data tambahan (build_extra.py)
        if f.exists():
            pend += json.loads(f.read_text(encoding="utf-8"))
    done = json.loads(I18N.read_text(encoding="utf-8")) if I18N.exists() else {}
    return [p for p in pend if p["en"] not in done], done


ORDER = ["skill", "awakening", "console", "profil", "kutipan", "story", "efek-arc", "deskripsi-arc", "efek-set", "deskripsi-set",
         "deskripsi-modul", "deskripsi-kendaraan", "slogan-properti", "deskripsi-properti", "kegunaan-item", "deskripsi-item", "ringkasan-cerita", "istilah", "kutipan-anomali", "cerita-anomali",
         "monster", "efek-makanan", "deskripsi-makanan", "deskripsi-fashion", "pencapaian"]


def rank(p):
    c = p["ctx"].split(":")[0]
    return ORDER.index(c) if c in ORDER else len(ORDER)


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "stats"
    pend, done = load()
    if cmd == "batch":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 40
        pref = sys.argv[3] if len(sys.argv) > 3 else ""
        sel = sorted([p for p in pend if p["ctx"].startswith(pref)], key=lambda p: (rank(p), p["ctx"]))
        out, size = [], 0
        for p in sel:
            if len(out) >= n or size > 9000:
                break
            out.append({"id": hid(p["en"]), "ctx": p["ctx"], "en": p["en"]})
            size += len(p["en"])
        print(json.dumps(out, ensure_ascii=False, indent=0))
        print(f"# {len(out)} teks, {size} karakter. Sisa: {len(pend)}", file=sys.stderr)
    elif cmd == "apply":
        tr = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
        by_id = {hid(p["en"]): p["en"] for p in pend}
        n = 0
        for k, v in tr.items():
            en = by_id.get(k)
            if en and v.strip():
                done[en] = v.strip()
                n += 1
            elif not en:
                print("id tidak dikenal / sudah ada:", k)
        I18N.write_text(json.dumps(done, ensure_ascii=False, indent=0, sort_keys=True), encoding="utf-8")
        print(f"ditambahkan {n}, total {len(done)}, sisa {len(pend) - n}")
    else:
        from collections import Counter
        c = Counter(p["ctx"].split(":")[0] for p in pend)
        ch = Counter()
        for p in pend:
            ch[p["ctx"].split(":")[0]] += len(p["en"])
        for k, v in sorted(c.items(), key=lambda x: ORDER.index(x[0]) if x[0] in ORDER else 99):
            print(f"{k:22} {v:5} teks  {ch[k]:8,} karakter")
        print(f"selesai: {len(done)}  sisa: {len(pend)}")


if __name__ == "__main__":
    main()
