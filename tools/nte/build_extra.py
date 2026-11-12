"""Data tambahan Arsip Hethereau, langsung dari teks game (Localization/en/game.json).

  python tools/nte/build_extra.py

Output nte/data/{story,anomalies,glossary,achievements,fashion,food}.json
Setiap teks berbentuk {"en": ..., "id": ...}. Terjemahan Indonesia disimpan di
tools/nte/i18n_id.json (sama dengan build.py); teks yang belum diterjemahkan dicatat
ke tools/nte/untranslated_extra.json dan tampil dalam bahasa Inggris. Nama tidak diterjemahkan.
Hanya teks Global (Inggris) yang dipakai: entri yang masih Mandarin / placeholder dibuang.
"""
import html
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
    s = html.unescape(s or "")
    return {"en": s, "id": s}


def loc(v):
    """Teks dari sel DataTable ({LocalizedString: ...})."""
    return html.unescape(B.clean(B.loc_text(v))) if v else ""


def pic(path, kind, size):
    """Gambar dari path aset game -> img/<kind>/x.webp (diunduh lewat build_images)."""
    return B.asset(path, kind, size) if path else ""


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
    # gambar bab dari menu "Plot Review" di game
    main_dt = B.table("DataTable/ReviewQuest/DT_MainReviewQuestData.json")
    sub_dt = B.table("DataTable/ReviewQuest/DT_SubRoleReviewQuestDataTable.json")
    roles = B.table("DataTable/ReviewQuest/DT_RoleReviewQuestDataTable.json")
    by_title = {B.loc_text(v["TitleDes"]).strip().lower(): v for v in sub_dt.values()}
    for x in out:
        sub = by_title.get(x["title"]["en"].strip().lower())
        row = main_dt.get(x["id"]) or sub
        if sub and not main_dt.get(x["id"]):  # bab yang di game ada di menu Spinoff
            x["group"], x["chapter"] = "spinoff", ""
        x["chapter"] = name(x["chapter"]) if x["chapter"] else None
        x["image"] = pic(row.get("SectionImage"), "story", 1280) if row else ""
        role = roles.get(str(row.get("RoleIndex"))) if row and row.get("RoleIndex") else None
        if role:
            x["role"] = B.loc_text(role["RoleDes"])
            x["roleIcon"] = pic(role.get("RoleSmallHeadImage"), "esper", 256)
    out.sort(key=lambda x: x["group"] != "utama")  # stabil: urutan bab tetap, utama dulu
    return out


# ------------------------------------------------------------------ anomali
CATE = {"Organism": "Bio", "Object": "Object", "Phenomenon": "Phenomenon", "Location": "Location", "Meme": "Meme"}
def build_anomalies():
    ns = "ST_Manual"
    t = LOC.get(ns, {})
    vm = B.table("DataTable/Vision/DT_VisionManual.json")
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
        row = vm.get(i, {})
        out.append({"id": i, "code": attr, "name": name, "class": i[0],
                    "level": B.loc_text(row.get("Level")) if row else "",
                    "access": B.loc_text(row.get("VisionPermission")) if row else "",
                    "cate": CATE.get(str(row.get("VisionCate", "")).split("::")[-1], "") if row else "",
                    "image": pic(row.get("ImageIcon"), "anomaly", 420) if row else "",
                    "quote": pair(desc, "kutipan-anomali"), "story": pair(story, "cerita-anomali") if story else None})
    out.sort(key=lambda x: (x["class"], x["id"]))
    mm = LOC.get("ST_MonsterManual", {})
    mc = B.table("DataTable/DT_MonsterManualConfig.json")
    mc_norm = {}
    for key, row in mc.items():
        km = re.match(r"(boss|mon)_0*(\d+)", key, re.I)
        if km:
            mc_norm.setdefault((km.group(1).lower(), int(km.group(2))), row)
    mons = []
    for k, v in mm.items():
        m = re.fullmatch(r"(boss|mon)_(\d+)_BP_Found", k)
        if m and ok(v):
            # kunci tabel kadang beda format (Boss_07_BP, mon_013_BP, mon_019_SadBear_BP)
            row = mc_norm.get((m.group(1), int(m.group(2))), {})
            if not row:  # tidak tercatat di buku monster: pakai ikon dengan nama file yang sama
                row = {"EnemyImage": f"/Game/UI/UI/MonsterManual/MonsterHeadIcon/200x200/{m.group(1)}_{m.group(2)}"}
            mons.append({"id": f"{m.group(1)}_{m.group(2)}", "kind": "Boss" if m.group(1) == "boss" else "Monster",
                         "name": B.loc_text(row.get("MonsterName")) if row else "",
                         "place": B.loc_text(row.get("EnemyPlace")) if row else "",
                         "image": pic(row.get("EnemyImage"), "monster", 200) if row else "",
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
# urutan & ikon kategori mengikuti menu Achievement di game
ACH_CAT = [("Social", "Sosial", 1), ("Play", "Aktivitas", 2), ("Explore", "Eksplorasi", 3), ("Interest", "Hobi", 4),
           ("Develop", "Pengembangan", 5), ("Fight", "Pertempuran", 6), ("Quest", "Misi", 7), ("City", "Kota", 8)]
ACH_Q = {"Normal": 1, "High": 2, "EXECELLENT": 3}


def item_icon(row):
    small = row.get("ItemIconSmall") or {}
    return pic(small if small.get("AssetPathName") else row.get("ItemIcon"), "item", 128)


def build_achievements():
    dt = B.table("DataTable/DT_AchievementConfigInfo.json")
    items = B.table("DataTable/Inventory/DT_ItemConfig.json")
    capital = B.table("DataTable/Inventory/DT_CapitalItemConfig.json")
    out = []
    for i, (k, v) in enumerate(dt.items()):
        title, cont = loc(v.get("TitleId")), loc(v.get("ContentID"))
        if not title or not cont or not ok(title):
            continue
        rewards = []
        for a in v.get("AwardInfo") or []:
            row = capital.get(a["ItemID"]) or items.get(a["ItemID"])
            if row:
                rewards.append({"name": B.loc_text(row.get("ItemName")), "amount": a.get("Amount", 1), "icon": item_icon(row)})
        out.append({"id": k, "cat": v["AchievementMainType"].split("MainType")[-1], "n": i,
                    "q": ACH_Q.get(str(v.get("Quality", "")).split("::")[-1], 1),
                    "icon": pic(v.get("icon"), "achievement", 128),
                    "title": name(title), "desc": pair(cont, "pencapaian"), "rewards": rewards})
    order = {c: n for n, (c, _, _) in enumerate(ACH_CAT)}
    out.sort(key=lambda x: (order.get(x["cat"], 99), x["n"]))
    for x in out:
        del x["n"]
    cats = [{"id": c, "name": n,
             "icon": pic(f"/Game/UI/UI/Achievement/UI_YH_Achievement_Normal_Btn{b}", "achievement", 96),
             "iconOn": pic(f"/Game/UI/UI/Achievement/UI_YH_Achievement_Select_Btn{b}", "achievement", 96)} for c, n, b in ACH_CAT]
    return {"categories": cats, "items": out}


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
            cid = m.group(1)
            char = names.get(cid) or B.L("ST_Player", f"Role_Name_{cid[-3:]}") or cid
            out.append({"id": f"{m.group(1)}_{m.group(2)}", "char": char,
                        "name": name(n), "desc": pair(d, "deskripsi-fashion") if d and "Test Fashion" not in d else None})
    # ilustrasi kostum dari tabel penampilan game
    app = B.table("DataTable/Character/Appearance/DT_AppearanceData.json")
    try:
        ports = {e["id"]: e.get("portrait") or e.get("icon", "") for e in json.loads((B.OUT_DATA / "espers.json").read_text(encoding="utf-8"))}
    except Exception:
        ports = {}
    for x in out:
        row = app.get(f"Fashion_{x['id']}", {})
        art = next((row.get(k) for k in ("SmallPortraitImg", "DisplayIcon", "ItemIcon") if (row.get(k) or {}).get("AssetPathName")), None)
        x["image"] = pic(art, "fashion", 720) if art else ""
        x["fallback"] = ports.get(x["id"].split("_")[0], "")  # dipakai bila ilustrasi belum ada di file game
        x["head"] = pic(row.get("HeadIconBig"), "fashion", 200) if (row.get("HeadIconBig") or {}).get("AssetPathName") else ""
        x["rarity"] = B.quality(row) if row else 1
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
    # ikon & rarity dari tabel item makanan; bahan masak dari daftar item umum
    fdt = B.table("DataTable/Food/DT_FoodItemData.json")
    by_name = {html.unescape(B.loc_text(v["ItemName"])).lower(): v for v in fdt.values()}
    try:
        items = {html.unescape(x["name"]).lower(): x for x in json.loads((B.OUT_DATA / "items.json").read_text(encoding="utf-8"))["items"]}
    except Exception:
        items = {}
    for x in out:
        key = x["name"]["en"].lower()
        row = by_name.get(key)
        if row:
            x["icon"], x["rarity"] = pic(row.get("ItemIcon"), "item", 256), B.quality(row)
        elif key in items:
            x["icon"], x["rarity"] = items[key].get("icon", ""), items[key].get("rarity", 1)
        else:
            x["icon"], x["rarity"] = "", 1
    out.sort(key=lambda x: (x["kind"], x["id"]))
    return out


def build_home(data):
    """Ringkasan kecil untuk beranda supaya tidak perlu memuat semua data (±2,5 MB)."""
    def rd(n):
        return json.loads((B.OUT_DATA / f"{n}.json").read_text(encoding="utf-8"))
    es, ar, md, it, fu, ve, pr = (rd(n) for n in ("espers", "arcs", "modules", "items", "furniture", "vehicles", "property"))
    th = lambda arr, key="icon": [x[key] for x in arr if x.get(key)][:3]
    an = data["anomalies"]
    cats = {
        "esper": (len(es), th(es)), "arc": (len(ar), th(ar)), "modul": (len(md["modules"]), th(md["sets"])),
        "item": (len(it["items"]), th([i for i in it["items"] if i["rarity"] >= 4])),
        "furnitur": (len(fu), th([i for i in fu if i["rarity"] >= 4])), "kendaraan": (len(ve), th(ve)),
        "properti": (len(pr), th(pr, "image")), "cerita": (len(data["story"]), th(data["story"], "roleIcon")),
        "anomali": (len(an["anomalies"]) + len(an["monsters"]), th(an["monsters"], "image")),
        "istilah": (len(data["glossary"]), []),
        "pencapaian": (len(data["achievements"]["items"]), th([x for x in data["achievements"]["items"] if x["q"] == 3])),
        "fashion": (len(data["fashion"]), th(data["fashion"], "head")),
        "makanan": (len(data["food"]), th(data["food"])),
    }
    roster = [{"slug": e["slug"], "name": e["name"], "rank": e["rank"], "element": e["element"], "arcType": e["arcType"],
               "arcTypeIcon": e.get("arcTypeIcon", ""), "icon": e["icon"], "portrait": e.get("portrait", ""), "title": e.get("title", ""),
               "desc": e.get("desc", ""), "intro": (e.get("profile") or {}).get("intro", "")} for e in es]
    return {"counts": {k: v[0] for k, v in cats.items()}, "thumbs": {k: v[1] for k, v in cats.items()}, "roster": roster,
            "stats": {"anomali": len(an["anomalies"])}}


def main():
    data = {
        "story": build_story(),
        "anomalies": build_anomalies(),
        "glossary": build_glossary(),
        "achievements": build_achievements(),
        "fashion": build_fashion(),
        "food": build_food(),
        # latar beranda: ilustrasi layar loading game
        "home": {"bg": [pic(f"/Game/UI/UI/loading/res/UI_YH_Loading_Image_{n}", "home", 1920) for n in ("005", "014", "016", "006", "001", "012")]},
    }
    for key, obj in data.items():
        B.save(key, finalize(obj))
        n = len(obj) if isinstance(obj, list) else sum(len(v) for v in obj.values() if isinstance(v, list))
        print(f"{key}: {n} entri")
    data["home"].update(build_home(data))
    B.save("home", data["home"])
    missing = B.build_images()
    if missing:
        bad = set(missing)
        for key in data:
            f = B.OUT_DATA / f"{key}.json"
            t = f.read_text(encoding="utf-8")
            for b in bad:
                t = t.replace('"' + b + '"', '""')
            f.write_text(t, encoding="utf-8")
    # daftar file sumber: gabungkan dengan milik build.py supaya check_update.py ikut memantau
    src_file = B.TOOLS / "sources.json"
    src = json.loads(src_file.read_text(encoding="utf-8"))
    resolve = B.image_resolver()
    src["data"] = sorted(set(src["data"]) | B.USED)
    for o, (rel, _) in B.IMAGES.items():
        real = resolve(rel)
        if real:
            src["images"][real] = o
    src["images"] = dict(sorted(src["images"].items()))
    src_file.write_text(json.dumps(src, ensure_ascii=False, indent=0), encoding="utf-8")
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
