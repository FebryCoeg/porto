"""Data tambahan Arsip Hethereau, langsung dari teks game (Localization/en/game.json).

  python tools/nte/build_extra.py

Output nte/data/{story,anomalies,glossary,achievements,fashion,food}.json
Setiap teks berbentuk {"en": ..., "id": ...}. Terjemahan Indonesia disimpan di
tools/nte/i18n_id.json (sama dengan build.py); teks yang belum diterjemahkan dicatat
ke tools/nte/untranslated_extra.json dan tampil dalam bahasa Inggris. Nama tidak diterjemahkan.
Hanya teks Global (Inggris) yang dipakai: entri yang masih Mandarin / placeholder dibuang.
"""
import json
import re

import build as B  # noqa: E402  (memakai LOC, clean, I18N dari build.py)

LOC = B.LOC
HAN = re.compile(r"[㐀-鿿]")
PEND_FILE = B.TOOLS / "untranslated_extra.json"
PENDING = {}  # teks Inggris yang belum diterjemahkan -> konteks


def ok(s):
    return bool(s) and "<!>" not in s and "*NOTRANSMARK*" not in s and not HAN.search(s) and s.strip() not in ("", "1", "11", "12")


def txt(ns, key):
    v = (LOC.get(ns) or {}).get(key, "")
    return B.clean(v) if ok(v) else ""


def pair(s, ctx):
    """Teks yang diterjemahkan (deskripsi, efek, cerita). "id" diisi saat finalisasi."""
    if s and not B.I18N.get(s):
        PENDING.setdefault(s, ctx)
    return {"en": s, "id": s}


def name(s):
    """Nama (item, quest, istilah, pencapaian, dll.) sengaja tidak diterjemahkan."""
    return {"en": s, "id": s}


def finalize(obj):
    """Ganti setiap {"en","id"} dengan terjemahan yang sudah ada."""
    if isinstance(obj, dict):
        if set(obj) == {"en", "id"} and isinstance(obj["en"], str):
            obj["id"] = B.I18N.get(obj["en"]) or obj["en"]
            return obj
        return {k: finalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [finalize(x) for x in obj]
    return obj


# ------------------------------------------------------------------ cerita
def build_story():
    ns = "ST_RoleReviewQuest"
    t = LOC.get(ns, {})
    groups = {"Main": ("utama", "Main Story"), "Role": ("spinoff", "Spinoff")}
    out = []
    for k, v in t.items():
        m = re.fullmatch(r"(Main|Role)_(\w+?)_des", k)
        if not m or not ok(v):
            continue
        title = txt(ns, k[:-4])
        if not title:
            continue
        g = groups[m.group(1)]
        out.append({
            "id": k[:-4], "group": g[0],
            "chapter": txt(ns, f"Main_{m.group(2).split('_')[0]}") if m.group(1) == "Main" else "",
            "title": name(title), "summary": pair(B.clean(v), "ringkasan-cerita"),
        })
    # bab 1.9 ada di tabel terpisah (ST_Main_Exe01)
    exe_t, exe_d = txt("ST_Main_Exe01", "Main_1_9"), txt("ST_Main_Exe01", "Main_1_9_des")
    if exe_t and exe_d:
        out.append({"id": "Main_1_9", "group": "utama", "chapter": txt(ns, "Main_1"), "title": name(exe_t), "summary": pair(exe_d, "ringkasan-cerita")})
    out.sort(key=lambda x: (x["group"] != "utama", [int(p) if p.isdigit() else 0 for p in re.findall(r"\d+", x["id"])] or [0], x["id"]))
    for x in out:
        x["chapter"] = name(x["chapter"]) if x["chapter"] else None
    # nama bab lain (Main_0, Main_1) dipakai sebagai kelompok
    return out


# ------------------------------------------------------------------ anomali
def build_anomalies():
    ns = "ST_Manual"
    t = LOC.get(ns, {})
    out = []
    for k in t:
        m = re.fullmatch(r"ManualVision_(\d+)_name", k)
        if not m:
            continue
        i = m.group(1)
        name, desc, attr = txt(ns, k), txt(ns, f"ManualVision_{i}_des"), txt(ns, f"ManualVision_{i}_attr")
        if not name or not desc:
            continue
        story = ""
        parts = re.split(r"\n\s*\n?\s*Anomaly Story:?\s*", desc, maxsplit=1)
        if len(parts) == 2:
            desc, story = parts[0].strip(), parts[1].strip()
        out.append({"id": i, "code": attr, "name": name, "class": i[0],
                    "quote": pair(desc, "kutipan-anomali"), "story": pair(story, "cerita-anomali") if story else None})
    out.sort(key=lambda x: (x["class"], x["id"]))
    mm = LOC.get("ST_MonsterManual", {})
    mons = []
    for k, v in mm.items():
        m = re.fullmatch(r"(boss|mon)_(\d+)_BP_Found", k)
        if m and ok(v):
            mons.append({"id": f"{m.group(1)}_{m.group(2)}", "kind": "Boss" if m.group(1) == "boss" else "Monster",
                         "desc": pair(B.clean(v), "monster")})
    mons.sort(key=lambda x: (x["kind"], x["id"]))
    return {"anomalies": out, "monsters": mons}


def build_glossary():
    ns = "ST_Manual"
    out = []
    for k in LOC.get(ns, {}):
        m = re.fullmatch(r"NounManual_(\d+_\d+)_name", k)
        if m:
            n, d = txt(ns, k), txt(ns, f"NounManual_{m.group(1)}_des")
            if n and d:
                out.append({"id": m.group(1), "name": name(n), "desc": pair(d, "istilah")})
    out.sort(key=lambda x: [int(p) for p in x["id"].split("_")])
    return out


# ------------------------------------------------------------------ achievement
ACH_CAT = {"Life": "Kehidupan", "friendship": "Persahabatan", "explore": "Eksplorasi", "Play": "Aktivitas", "battle": "Pertempuran",
           "develop": "Pengembangan", "interest": "Hobi", "quest": "Misi", "Playstation": "Playstation"}


def build_achievements():
    ns = "ST_Achievement"
    out = []
    for k in LOC.get(ns, {}):
        m = re.fullmatch(r"(\w+?)_(\d+)_Title", k)
        if not m or m.group(1) not in ACH_CAT:
            continue
        title, cont = txt(ns, k), txt(ns, f"{m.group(1)}_{m.group(2)}_Content")
        if title and cont:
            out.append({"id": f"{m.group(1)}_{m.group(2)}", "cat": m.group(1), "title": name(title), "desc": pair(cont, "pencapaian")})
    out.sort(key=lambda x: (x["cat"], int(x["id"].split("_")[1])))
    return {"categories": [{"id": c, "name": n} for c, n in ACH_CAT.items()], "items": out}


# ------------------------------------------------------------------ fashion
def build_fashion():
    ns = "ST_Appearance"
    names = {}
    try:
        for e in json.loads((B.OUT_DATA / "espers.json").read_text(encoding="utf-8")):
            names[e["id"]] = e["name"]
    except Exception:
        pass
    out = []
    for k in LOC.get(ns, {}):
        m = re.fullmatch(r"Fashion_(\d+)_(\w+?)_Name", k)
        if not m:
            continue
        n, d = txt(ns, k), txt(ns, f"Fashion_{m.group(1)}_{m.group(2)}_Desc")
        # entri placeholder seperti "Fashion 2 Name" bukan kostum sungguhan
        if n and not re.fullmatch(r"Fashion \d+ Name", n) and "Test Fashion" not in n:
            out.append({"id": f"{m.group(1)}_{m.group(2)}", "char": names.get(m.group(1), m.group(1)),
                        "name": name(n), "desc": pair(d, "deskripsi-fashion") if d and "Test Fashion" not in d else None})
    out.sort(key=lambda x: (x["char"], x["id"]))
    return out


# ------------------------------------------------------------------ makanan
def build_food():
    ns = "ST_food"
    out = []
    for k in LOC.get(ns, {}):
        m = re.fullmatch(r"[Ff]ood_(\d+)_name", k)
        if m:
            i = m.group(1)
            n = txt(ns, k)
            if n:
                use = txt(ns, f"Food_{i}_usedesc") or txt(ns, f"Food_usedesc_{i}")
                out.append({"id": i, "kind": "food", "name": name(n),
                            "desc": pair(txt(ns, f"Food_{i}_desc"), "deskripsi-makanan") if txt(ns, f"Food_{i}_desc") else None,
                            "effect": pair(use, "efek-makanan") if use else None})
    for k in LOC.get(ns, {}):
        m = re.fullmatch(r"CookMaterial_(\d+)_Name", k)
        if m:
            n, d = txt(ns, k), txt(ns, f"CookMaterial_{m.group(1)}_Desc")
            if n:
                out.append({"id": "m" + m.group(1), "kind": "material", "name": name(n), "desc": pair(d, "deskripsi-makanan") if d else None, "effect": None})
    out.sort(key=lambda x: (x["kind"], x["id"]))
    return out


def main():
    data = {
        "story": build_story(),
        "anomalies": build_anomalies(),
        "glossary": build_glossary(),
        "achievements": build_achievements(),
        "fashion": build_fashion(),
        "food": build_food(),
    }
    for key, obj in data.items():
        B.save(key, finalize(obj))
        n = len(obj) if isinstance(obj, list) else sum(len(v) for v in obj.values() if isinstance(v, list))
        print(f"{key}: {n} entri")
    pend = [{"en": k, "ctx": v} for k, v in PENDING.items()]
    PEND_FILE.write_text(json.dumps(pend, ensure_ascii=False, indent=1), encoding="utf-8")
    # progres terjemahan di footer = data utama + data tambahan
    meta_file = B.OUT_DATA / "meta.json"
    meta = json.loads(meta_file.read_text(encoding="utf-8"))
    base = json.loads((B.TOOLS / "untranslated.json").read_text(encoding="utf-8"))
    meta["translated"], meta["pending"] = len(B.I18N), len(base) + len(PENDING)
    B.save("meta", meta)
    print(f"terjemahan tambahan: {len(PENDING)} belum ({sum(len(k) for k in PENDING):,} karakter)")


if __name__ == "__main__":
    main()
