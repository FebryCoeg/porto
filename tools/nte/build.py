"""Build database Neverness to Everness dari data mentah NTE_Assets.

Sumber : https://github.com/Waifus-Grace/NTE_Assets (data & gambar hasil ekstrak game)
Output : nte/data/*.json  (data per kategori, teks sudah diterjemahkan bila ada)
         nte/img/**.webp  (gambar yang dipakai, dikecilkan)
         tools/nte/untranslated.json (teks yang belum ada terjemahannya)

Terjemahan Indonesia disimpan di tools/nte/i18n_id.json  {teks Inggris: teks Indonesia}.
Nama (karakter, item, skill, arc, dll.) sengaja tidak diterjemahkan.

Pemakaian:  python tools/nte/build.py [--no-images]
"""
import concurrent.futures as cf
import hashlib
import io
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools" / "nte"
CACHE = Path(os.environ.get("NTE_CACHE", TOOLS / ".cache"))
OUT_DATA = ROOT / "nte" / "data"
OUT_IMG = ROOT / "nte" / "img"
RAW = "https://raw.githubusercontent.com/Waifus-Grace/NTE_Assets/main/"
NO_IMAGES = "--no-images" in sys.argv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# ------------------------------------------------------------------ unduhan
def fetch(rel, binary=False):
    p = CACHE / rel
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        url = RAW + urllib.parse.quote(rel)
        data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "nte-db-build"}), timeout=60).read()
        p.write_bytes(data)
    return p.read_bytes() if binary else p.read_text(encoding="utf-8-sig")

import urllib.parse  # noqa: E402

def table(rel):
    d = json.loads(fetch(rel))
    return d[0].get("Rows", {}) if isinstance(d, list) else d

def loc_text(v):
    if isinstance(v, dict):
        return v.get("LocalizedString") or v.get("CultureInvariantString") or ""
    return v or ""

LOC = json.loads(fetch("Localization/en/game.json"))
def L(ns, key):
    return (LOC.get(ns) or {}).get(key, "")

# ------------------------------------------------------------------ teks
TAG_HL = re.compile(r"<(NumGreen|lv|TextHLT|Ling|Red|red|blue|Blue|Yellow|Orange|Bold|NumRed|NumYellow|TextEXPL|Highlight)[^>]*>(.*?)</>", re.S)
TAG_HOT = re.compile(r'<hot[^>]*>(.*?)</>', re.S)
TAG_IT = re.compile(r"<Italic>(.*?)</>", re.S)
TAG_ANY = re.compile(r"<[A-Za-z][^<>]*>(.*?)</>", re.S)

def clean(s):
    """Teks game -> HTML sederhana (<b>, <i>, baris baru)."""
    if not s:
        return ""
    s = s.replace("\r\n", "\n").replace("\r", "\n").strip()
    s = s.replace("&", "&amp;")
    for _ in range(3):
        s = TAG_IT.sub(r"<i>\1</i>", s)
        s = TAG_HOT.sub(r"<b>\1</b>", s)
        s = TAG_HL.sub(r"<b>\2</b>", s)
        s = TAG_ANY.sub(r"\1", s)
    s = re.sub(r"<(?!/?[bi]>)", "&lt;", s)
    s = s.replace("「", "\"").replace("」", "\"")
    return s.strip()

def plain(s):
    return re.sub(r"<[^>]+>", "", clean(s)).replace("&amp;", "&").replace("&lt;", "<")

I18N_FILE = TOOLS / "i18n_id.json"
I18N = json.loads(I18N_FILE.read_text(encoding="utf-8")) if I18N_FILE.exists() else {}
PENDING = {}  # teks Inggris yang belum diterjemahkan -> konteks

def T(s, ctx=""):
    """Terjemahkan teks (efek, deskripsi, story). Kembalikan teks Indonesia bila ada."""
    s = clean(s) if s and "<" in s and "</>" in s else (s or "").replace("\r\n", "\n").strip()
    if not s:
        return ""
    if re.fullmatch(r"[\d\s.,%+\-*/:{}()sx]+", s):
        return s
    if s in I18N and I18N[s]:
        return I18N[s]
    PENDING.setdefault(s, ctx)
    return s

# ------------------------------------------------------------------ gambar
IMAGES = {}  # path repo (png) -> (path output, ukuran maks)

def asset(path, kind, size):
    """'/Game/UI/UI_Icon/Item/x.x' -> 'img/<kind>/x.webp' (dicatat untuk diunduh)."""
    if isinstance(path, dict):
        path = path.get("AssetPathName", "")
    if not path or path == "None":
        return ""
    p = path.split(".")[0]
    if not p.startswith("/Game/UI/"):
        return ""
    rel = p[len("/Game/UI/"):] + ".png"
    name = Path(rel).stem.lower()
    out = f"img/{kind}/{name}.webp"
    IMAGES[rel] = (out, size)
    return out

def build_images():
    from PIL import Image
    todo = [(rel, out, size) for rel, (out, size) in IMAGES.items() if not (ROOT / "nte" / out).exists()]
    print(f"gambar: {len(IMAGES)} total, {len(todo)} perlu dibuat")
    missing = []

    tree = json.loads(fetch_tree())
    by_path = {p.lower(): p for p in tree}
    by_name = {}
    for p in tree:
        if p.startswith(("UI/", "UI_Icon/")):
            by_name.setdefault(Path(p).name.lower(), p)

    def work(item):
        rel, out, size = item
        # nama file di repo kadang beda huruf besar/kecil atau beda folder
        real = by_path.get(rel.lower()) or by_name.get(Path(rel).name.lower())
        try:
            data = fetch(real or rel, binary=True)
        except Exception:
            missing.append(rel)
            return
        im = Image.open(io.BytesIO(data))
        im = im.convert("RGBA")
        im.thumbnail((size, size), Image.LANCZOS)
        dst = ROOT / "nte" / out
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=82, method=6)

    with cf.ThreadPoolExecutor(16) as ex:
        list(ex.map(work, todo))
    if missing:
        print("  gambar tidak ditemukan:", len(missing))
    return set(missing)

# ------------------------------------------------------------------ umum
QUALITY = {"WHITE": 1, "GREEN": 2, "BLUE": 3, "PURPLE": 4, "ORANGE": 5, "RED": 6, "GOLD": 6}
def quality(r):
    q = (r.get("ItemQuality") or "").rsplit("_", 1)[-1]
    return QUALITY.get(q, 1)

ELEMENT = {"COSMOS": "Cosmos", "NATURE": "Anima", "INCANTATION": "Incantation", "CHAOS": "Chaos", "PSYCHE": "Psyche", "LAKSHANA": "Lakshana"}
GROUP = {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5}

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def save(name, data):
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    (OUT_DATA / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {name}: {len(data) if isinstance(data, list) else 'ok'}")

# ------------------------------------------------------------------ arc types
FORK_TYPES = {}
for k, r in table("DataTable/Fork/DT_ForkTypeData.json").items():
    FORK_TYPES[int(k)] = {"name": loc_text(r.get("TypeName")), "icon": asset(r.get("TypeIcon"), "ui", 96)}

# ------------------------------------------------------------------ ESPER
def esper_profile(name):
    """Profil & arsip dari ST_File (dicocokkan lewat nama)."""
    f = LOC.get("ST_File", {})
    num = None
    for k, v in f.items():
        m = re.fullmatch(r"F_(NPC\d+)_001", k)
        if m and (v.strip().lower() == name.strip().lower() or v.strip().lower().startswith(name.strip().lower() + " ")):
            num = m.group(1)
            break
    if not num:
        return None
    g = lambda i: f.get(f"F_{num}_{i:03d}", "")
    stories = []
    titles = [f.get(f"file_{num}_{i:03d}", "") for i in range(1, 9)]
    titles = [t for t in titles if t]
    body = [g(i) for i in range(11, 20) if g(i)]
    for i, text in enumerate(body):
        stories.append({"title": titles[i - (len(body) - len(titles))] if 0 <= i - (len(body) - len(titles)) < len(titles) else "", "text": T(text, f"story:{name}")})
    return {
        "birthday": g(2),
        "occupation": g(3),
        "esperAbility": g(5),
        "faction": g(6),
        "intro": T(g(7), f"profil:{name}"),
        "quote": T(g(8), f"kutipan:{name}"),
        "impression": T(g(9), f"profil:{name}"),
        "food": g(10),
        "stories": stories,
    }

SKILL_GROUPS = [
    ("basic", re.compile(r"^(Melee|AirAttack|Attack|NormalAttack)")),
    ("reflexive", re.compile(r"^(PerfectEvade|Evade|Dodge)")),
    ("redirect", re.compile(r"^Skill")),
    ("ultimate", re.compile(r"^(UltraSkill|UtraSkill|Ultra|Ult)")),
    ("support", re.compile(r"^(QTE|Support)")),
    ("passive", re.compile(r"^Passive")),
]

def esper_skills(ns, name):
    d = LOC.get(ns, {})
    if not d:
        return [], []
    groups = {g: [] for g, _ in SKILL_GROUPS}
    for k, v in d.items():
        m = re.match(r"^(GA_[A-Za-z0-9]+_)(.+)_name$", k)
        if not m:
            continue
        P, base = m.group(1), m.group(2)
        if base.startswith("star"):
            continue
        evolve = base.startswith("Evolve_")
        g = next((g for g, rx in SKILL_GROUPS if rx.match(base[7:] if evolve else base)), None)
        if not g:
            continue
        des = d.get(P + base + "_des") or d.get(P + base + "_des_tidy") or ""
        if not des:
            continue
        bgk = P + re.sub(r"\d+$", "", base).rstrip("_") + "_background"
        bg = d.get(P + base + "_background") or (d.get(bgk) if not re.search(r"\d$", base) else "")
        order = int(re.search(r"(\d+)$", base).group(1)) if re.search(r"(\d+)$", base) else 0
        groups[g].append({"o": order + (100 if evolve else 0), "name": plain(v),"desc": T(des, f"skill:{name}"), "quote": T(bg, f"kutipan-skill:{name}") if bg else ""})
    skills = []
    for g, _ in SKILL_GROUPS:
        items = sorted(groups[g], key=lambda x: x["o"])
        seen = set()
        for it in items:
            key = (it["name"], it["desc"])
            if key in seen:
                continue
            seen.add(key)
            it.pop("o")
            skills.append(dict(group=g, **it))
    extras = []
    prefixes = sorted({re.match(r"^(GA_[A-Za-z0-9]+_)", k).group(1) for k in d if re.match(r"^GA_[A-Za-z0-9]+_starExtra", k)})
    for i in (1, 2, 3):
        for P in prefixes:
            nm, ds = d.get(f"{P}starExtra{i}_name"), d.get(f"{P}starExtra{i}_des")
            if nm and ds:
                extras.append({"name": plain(nm), "desc": T(ds, f"console:{name}")})
                break
    return skills, extras

def build_espers():
    chars = table("DataTable/Character/DT_Character.json")
    like = table("DataTable/LikeabilitySystem/DT_LikeabilityRoleData.json")
    tree = json.loads(fetch_tree())
    awaken_files = {}
    for x in tree:
        m = re.match(r"DataTable(?:_4N)?/(?:Character/)?Awaken/(?:ft_character_)?(\w+?)AwakenEffect\d?\.json$", x)
        if m:
            awaken_files.setdefault(m.group(1), x)
    out = []
    for cid, r in chars.items():
        name = loc_text(r.get("ItemName")).strip()
        if not name or cid == "1999" or cid not in awaken_files:
            continue
        ed = r.get("ElementData") or {}
        aw_rows = table(awaken_files[cid])
        aw = next(iter(aw_rows.values()), {}) if aw_rows else {}
        ns = ""
        awaken = []
        for e in aw.get("AwakenEffectStructList", []):
            title = e.get("Title") or {}
            if not ns and isinstance(title, dict) and title.get("TableId"):
                ns = title["TableId"].split("/")[-1].split(".")[0]
            awaken.append({"name": plain(loc_text(title)), "desc": T(loc_text(e.get("Desc")), f"awakening:{name}"), "icon": asset(e.get("AwakenIcon"), "awaken", 128)})
        skills, extras = esper_skills(ns, name)
        lk = like.get(cid, {})
        prof = esper_profile(name) or {}
        el = (ed.get("CharacterElementType") or "").rsplit("_", 1)[-1]
        grp = GROUP.get((ed.get("CharacterGroupType") or "").rsplit("_", 1)[-1], 0)
        gender = ""
        if cid in ("1046", "1051"):
            gender = "♂" if cid == "1046" else "♀"
        out.append({
            "id": cid,
            "slug": slug(name + ("-" + cid if cid in ("1046", "1051") else "")),
            "name": name + (f" ({gender})" if gender else ""),
            "rank": "S" if quality(r) >= 5 else "A",
            "element": ELEMENT.get(el, el.title()),
            "arcType": FORK_TYPES.get(grp, {}).get("name", ""),
            "arcTypeIcon": FORK_TYPES.get(grp, {}).get("icon", ""),
            "title": loc_text(lk.get("TitleNameText")),
            "desc": T(loc_text(lk.get("RoleDescText")), f"profil:{name}"),
            "icon": asset(r.get("ItemIconBig") or r.get("ItemIcon"), "esper", 256),
            "portrait": asset(ed.get("AbilityUIIcon"), "esper-art", 1100),
            "color": "#" + (((ed.get("AbilityUIColor") or {}).get("SpecifiedColor") or {}).get("Hex") or "8FB4FF")[:6],
            "profile": prof,
            "skills": skills,
            "awakening": awaken,
            "console": extras,
        })
    out.sort(key=lambda x: (x["rank"] != "S", x["name"]))
    save("espers", out)

_TREE = None
def fetch_tree():
    global _TREE
    p = CACHE / "_tree.json"
    if not p.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request("https://api.github.com/repos/Waifus-Grace/NTE_Assets/git/trees/main?recursive=1", headers={"User-Agent": "nte-db-build"})
        d = json.loads(urllib.request.urlopen(req, timeout=60).read())
        p.write_text(json.dumps([x["path"] for x in d["tree"] if x["type"] == "blob"]), encoding="utf-8")
    return p.read_text(encoding="utf-8")

# ------------------------------------------------------------------ ARC
def curve_value(c, t):
    keys = (c or {}).get("Keys") or []
    if not keys:
        return None
    if t <= keys[0]["Time"]:
        return keys[0]["Value"]
    for a, b in zip(keys, keys[1:]):
        if a["Time"] <= t <= b["Time"]:
            f = (t - a["Time"]) / ((b["Time"] - a["Time"]) or 1)
            return a["Value"] + (b["Value"] - a["Value"]) * f
    return keys[-1]["Value"]

def fmt(v, pct):
    if v is None:
        return "?"
    if pct:
        v = v * 100
        return (f"{v:.1f}".rstrip("0").rstrip(".")) + "%"
    return f"{v:.2f}".rstrip("0").rstrip(".")

def build_arcs():
    forks = table("DataTable/Fork/DT_ForkItemData.json")
    stars = table("DataTable/Fork/DT_ForkUpgradeStarDataTable.json")
    curves = table("DataTable/Fork/CT_ForkBuff.json")
    out = []
    for fid, r in forks.items():
        name = loc_text(r.get("ItemName"))
        ed = r.get("ElementData") or {}
        if not name or not ed:
            continue
        pack = ed.get("UpgradeStarPackID", "")
        tiers = [stars.get(f"{pack}_{i}") for i in range(1, 6)]
        tiers = [t for t in tiers if t]
        effect = None
        if tiers:
            t0 = tiers[0]
            values = []
            for i, t in enumerate(tiers, 1):
                vals = []
                for dl in t.get("DataList", []):
                    vals.append(fmt(curve_value(curves.get(dl.get("NameId")), i), dl.get("bIsPercent")))
                values.append(vals)
            effect = {"name": plain(loc_text(t0.get("Title"))).strip('"'), "text": T(loc_text(t0.get("Description")), f"efek-arc:{name}"), "values": values}
        grp = GROUP.get((ed.get("ApplyGroupType") or "").rsplit("_", 1)[-1], 0)
        out.append({
            "id": fid,
            "slug": slug(name),
            "name": name,
            "rarity": quality(r),
            "type": FORK_TYPES.get(grp, {}).get("name", ""),
            "typeIcon": FORK_TYPES.get(grp, {}).get("icon", ""),
            "icon": asset(r.get("ItemIcon"), "arc", 256),
            "card": asset(ed.get("ForkCard"), "arc-card", 900),
            "desc": T(loc_text(r.get("Description")) or loc_text(r.get("UseContext")), f"deskripsi-arc:{name}"),
            "effect": effect,
        })
    # buang duplikat nama (versi uji coba)
    seen, uniq = set(), []
    for a in sorted(out, key=lambda x: (-x["rarity"], x["name"])):
        if a["slug"] in seen:
            continue
        seen.add(a["slug"])
        uniq.append(a)
    save("arcs", uniq)

# ------------------------------------------------------------------ MODUL
def build_modules():
    eq = table("DataTable/Equipment/DT_Equipment.json")
    suits = table("DataTable/Equipment/DT_EquipmentSuitData.json")
    sets = []
    for sid, s in suits.items():
        title = loc_text(s.get("SuitTitle"))
        bonuses = [{"pieces": x.get("SuitCondition"), "text": T(re.sub(r"^[^:：]*[(\[]\d[)\]][:：]\s*", "", loc_text(x.get("SuitBuffDescription"))), f"efek-set:{title}")} for x in s.get("SuitStructList", [])]
        sets.append({"id": sid, "name": title, "desc": T(loc_text(s.get("SuitDescription")), f"deskripsi-set:{title}"), "icon": asset(s.get("SuitIcon"), "module", 160), "bonuses": bonuses, "modules": []})
    by_pack = {s["id"]: s for s in sets}
    modules = []
    for mid, r in eq.items():
        name = loc_text(r.get("ItemName"))
        ed = r.get("ElementData") or {}
        if not name:
            continue
        m = {
            "id": mid, "name": name, "rarity": quality(r),
            "kind": loc_text(ed.get("ItemNickName")),
            "core": bool(ed.get("IsCore")),
            "slots": ed.get("OwnGridNum"),
            "icon": asset(r.get("ItemIcon"), "module", 160),
            "desc": T(loc_text(r.get("Description")) or loc_text(r.get("UseContext")), f"deskripsi-modul:{name}"),
            "set": "",
        }
        sp = ed.get("SuitPackID")
        if sp and sp in by_pack:
            m["set"] = by_pack[sp]["name"]
            by_pack[sp]["modules"].append(mid)
        modules.append(m)
    save("modules", {"sets": sets, "modules": sorted(modules, key=lambda x: (-x["rarity"], x["name"]))})

# ------------------------------------------------------------------ ITEM, FURNITUR, KENDARAAN, PROPERTI
def _txt(r):
    return (plain(loc_text(r.get("UseContext"))) + " | " + plain(loc_text(r.get("ItemName")))).lower()

ITEM_CATS = [
    ("material", "Material Pengembangan", lambda r, tags, t: "DevelopMaterial" in tags or t in ("EQUIPMENT_MATERIAL", "FORK_MATERIAL") or "Material" in " ".join(tags)),
    ("karakter", "Karakter", lambda r, tags, t: t in ("CHARACTER_FRAGMENT", "CHARACTER_CARD")),
    ("hadiah", "Hadiah Keakraban", lambda r, tags, t: t == "LIKEABILITY_GIFT" or "Gift" in tags),
    ("masak", "Masakan & Bahan", lambda r, tags, t: t in ("COOK_MATERIAL", "COOK_BOOK", "FRUIT", "SEED") or "Food" in " ".join(tags)),
    ("profil", "Kustomisasi Profil", lambda r, tags, t: any(w in _txt(r) for w in ("phone case", "namecard", "avatar", "title:", "grants the title", "sticker"))),
    ("koleksi", "Koleksi", lambda r, tags, t: "furniture" in tags or t in ("FIGURES", "SHOWCASE", "MUSIC", "FLOWER", "BIG_FLOWER", "FISH_KEEP", "DECORATION", "LANDSPACE", "LANDSPACE_BIG", "LANDSPACE_CIRCLE", "LANDSPACE_CIRCLE_BIG")),
    ("kostum", "Kostum & Gaya", lambda r, tags, t: t in ("FASHION", "GLIDE") or "dye orb" in _txt(r) or "outfit" in _txt(r)),
    ("paket", "Paket & Kotak", lambda r, tags, t: any(w in _txt(r) for w in (" box", " pack", "chest", "bundle", "crate", "supply"))),
    ("penting", "Item Penting", lambda r, tags, t: t in ("IMPORTANT", "Lottery", "SHOP_POINT", "EXCHANGE_TICKET", "DISCOUNT_CARD")),
    ("misi", "Item Misi", lambda r, tags, t: t in ("QUEST", "LOCKER_KEY")),
    ("lainnya", "Lainnya", lambda r, tags, t: True),
]

def build_items():
    items = table("DataTable/Inventory/DT_ItemConfig.json")
    fattr = table("DataTable/RealEstate/DT_FurnitureAttributeDataTable.json")
    out, furn = [], []
    skip = ("FURNITURE", "VEHICLE_SKIN", "TANKBATTLE_BULLET", "TANKBATTLE_CONSUMABLE", "DEFENDATHENA_CONSUMABLE", "NONE", "AUTO_USE", "MOVABLEPLAYER", "WORLD_LAYOUT")
    for iid, r in items.items():
        name = plain(loc_text(r.get("ItemName")))
        if not name or name.lower().startswith(("test", "测试")):
            continue
        t = (r.get("ItemType") or "").replace("EItemType::ITEM_TYPE_", "")
        icon = asset(r.get("ItemIcon"), "item", 160)
        base = {
            "id": iid, "name": name, "rarity": quality(r), "icon": icon,
            "use": T(loc_text(r.get("UseContext")), f"kegunaan-item:{name}"),
            "desc": T(loc_text(r.get("Description")), f"deskripsi-item:{name}"),
        }
        if t == "FURNITURE":
            a = fattr.get(iid) or {}
            base["icon"] = asset(r.get("ItemIcon"), "furniture", 200)
            base["stats"] = {k: a.get(k, 0) for k in ("Comfort", "Fortune", "Love", "Collect")} if a else {}
            furn.append(base)
            continue
        if t in skip or not icon:
            continue
        tags = r.get("ItemTags") or []
        cat = next(c for c, _, f in ITEM_CATS if f(r, tags, t))
        base["cat"] = cat
        out.append(base)
    save("items", {"categories": [{"id": c, "name": n} for c, n, _ in ITEM_CATS], "items": sorted(out, key=lambda x: (-x["rarity"], x["name"]))})
    save("furniture", sorted(furn, key=lambda x: (-x["rarity"], x["name"])))

def build_vehicles():
    vd = table("DataTable/Vehicle/DT_VehicleData.json")
    out, seen = [], set()
    for vid, r in vd.items():
        name = loc_text(r.get("Name"))
        if not name or name in seen:
            continue
        desc = loc_text(r.get("Description"))
        if not desc:
            continue
        seen.add(name)
        out.append({
            "id": vid, "name": name, "brand": loc_text(r.get("Brand")),
            "kind": (r.get("VehicleKeyType") or "").split("_")[-1].title(),
            "source": (r.get("GetVehicleSourceType") or "").split("_")[-1].title(),
            "icon": asset(r.get("UnLockNormalIcon"), "vehicle", 320),
            "desc": T(desc, f"deskripsi-kendaraan:{name}"),
        })
    save("vehicles", sorted(out, key=lambda x: (x["brand"], x["name"])))

def build_property():
    re_ = table("DataTable/RealEstate/DT_RealEstate.json")
    out = []
    for pid, r in re_.items():
        name = loc_text(r.get("RealEstateName"))
        if not name:
            continue
        out.append({
            "id": pid, "name": name, "area": loc_text(r.get("BelongsAreaText")),
            "slogan": T(loc_text(r.get("Slogan")), f"slogan-properti:{name}"),
            "address": loc_text(r.get("address")),
            "desc": T(loc_text(r.get("RealEstateDesc")), f"deskripsi-properti:{name}"),
            "image": asset(r.get("RealEstateNameImage"), "property", 900),
        })
    save("property", out)

# ------------------------------------------------------------------ main
def main():
    print("membangun data…")
    build_espers()
    build_arcs()
    build_modules()
    build_items()
    build_vehicles()
    build_property()
    missing = set() if NO_IMAGES else build_images()
    if missing:
        # kosongkan path gambar yang gagal supaya website tidak menampilkan gambar rusak
        bad = {IMAGES[m][0] for m in missing}
        for f in OUT_DATA.glob("*.json"):
            s = f.read_text(encoding="utf-8")
            for b in bad:
                s = s.replace(f'"{b}"', '""')
            f.write_text(s, encoding="utf-8")
    pend = [{"en": k, "ctx": v} for k, v in PENDING.items()]
    (TOOLS / "untranslated.json").write_text(json.dumps(pend, ensure_ascii=False, indent=1), encoding="utf-8")
    total = len(PENDING) + sum(1 for _ in I18N)
    chars = sum(len(k) for k in PENDING)
    meta = {"source": "Waifus-Grace/NTE_Assets", "translated": len(I18N), "pending": len(PENDING)}
    save("meta", meta)
    print(f"terjemahan: {len(I18N)} selesai, {len(PENDING)} belum ({chars:,} karakter)")

if __name__ == "__main__":
    main()
