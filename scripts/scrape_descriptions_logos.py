#!/usr/bin/env python3
"""
Scrape facility descriptions and venue logos from lrso.co.uk, upload to Supabase.
- Descriptions: Normal_text spans grouped below each Heading_2_b div
- Logos: PNG images ~258px wide near the top of each facilities page
"""

import re, time, requests
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = "https://urjwjvjdtdibjmvouofh.supabase.co"
KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyandqdmpkdGRpYmptdm91b2ZoIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM4MDcsImV4cCI6MjA5NzMxOTgwN30."
    "YT0OmvbEeGsQ3VUCFAWxmeZPOlD252hc7MY_JaPj9rM"
)
BASE = "https://www.lrso.co.uk"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

VENUES = {
    "371d9d2e-e6e7-429a-9b72-1d94a0c6155d": ("Bluecoat Aspley Academy",          f"{BASE}/baa%20facilities.htm"),
    "7f080264-220f-42b6-8d0f-e6cd4ea207f8": ("Bluecoat Beechdale Academy",       f"{BASE}/bba%20facilities.htm"),
    "c8ed4948-ff5a-4d5c-aa71-f4d8bcf93f70": ("Bluecoat Trent Academy",           f"{BASE}/trent%20facilities.htm"),
    "ba2ed891-a3c3-479e-85bc-ebe3aa2426b0": ("Bluecoat Wollaton Academy",        f"{BASE}/wollaton%20facilities.htm"),
    "40509ab3-6421-40f1-b412-c7e12cf67082": ("Coombe Wood School",               f"{BASE}/cws%20facilities.htm"),
    "b5d6fa40-c11f-4869-a0e4-bc6d26708f00": ("Ipswich Academy",                  f"{BASE}/lipswich%20ac%20facilities.htm"),
    "5e100163-de41-4186-86e3-467a2569bc26": ("Lees Brook Academy",               f"{BASE}/lees%20brook%20facilities.htm"),
    "420e1842-f122-4d79-a005-f661a8362c08": ("Murrayfield Primary",              f"{BASE}/murrayfield%20fqcilities.htm"),
    "8b1a1fa8-a87b-49d7-bd3a-a98118f6b7f4": ("The Nottingham Emmanuel School",   f"{BASE}/nes%20facilities.htm"),
    "e2aa5d16-cd79-4b78-8fcb-74a69ac0ec05": ("Piper's Vale Academy",             f"{BASE}/pipers%20vale%20facilities.htm"),
    "673a5b89-b7b6-4b8e-af7e-8eae067bc93d": ("Riddlesdown Collegiate",           f"{BASE}/riddlesdown%20facilities.htm"),
    "add44364-51ef-4299-8a2d-6b7ce866369a": ("Wallington County Grammar School", f"{BASE}/wcgs%20facilities.htm"),
    "b79f491b-c0ca-47fb-9986-5a7819887cdb": ("Westlea Primary School",           f"{BASE}/westlea%20facilities.htm"),
    "41c975b8-17f8-4eaf-8134-981b5cd7adb5": ("Woodbridge Road Academy",          f"{BASE}/woodbridge%20facilities.htm"),
}


def get_top(el) -> int:
    m = re.search(r"top:\s*(-?\d+)px", el.get("style", ""))
    return int(m.group(1)) if m else 999999


def get_width(el) -> int:
    m = re.search(r"width:\s*(\d+)px", el.get("style", ""))
    return int(m.group(1)) if m else 0


def extract_logo_url(soup: BeautifulSoup) -> str | None:
    """Find the school logo: a PNG near the top, ~150-350px wide, not the hero banner."""
    candidates = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if not src.endswith(".png"):
            continue
        top = get_top(img)
        w = get_width(img)
        # Logo: near top of page, reasonable logo width, not the full-width hero
        if top < 300 and 100 < w < 400:
            candidates.append((top, w, src))
    if not candidates:
        return None
    # Pick the one with the largest width (most likely the school logo)
    candidates.sort(key=lambda x: -x[1])
    return f"{BASE}/{candidates[0][2]}"


def extract_descriptions(soup: BeautifulSoup) -> dict[str, str]:
    """Return {facility_name: description}.
    
    Each facility section is a top-level div with a large page-level top value
    containing both the facility h2 name(s) and Normal_text description spans.
    """
    result = {}

    for div in soup.find_all("div"):
        style = div.get("style", "")
        top_m = re.search(r"top:\s*(\d+)px", style)
        if not top_m or int(top_m.group(1)) < 300:
            continue

        h2s = div.find_all("h2")
        spans = div.find_all("span", class_=lambda c: c and "Normal_text" in c)
        if not h2s or not spans:
            continue

        names = [h.get_text(" ", strip=True) for h in h2s
                 if h.get_text(strip=True) and len(h.get_text(strip=True)) < 80]
        texts = [s.get_text(" ", strip=True) for s in spans
                 if len(s.get_text(strip=True)) > 15]

        if not names or not texts:
            continue

        full_desc = " ".join(texts).strip()

        if len(names) == 1:
            result[names[0]] = full_desc
        else:
            # Split texts evenly across side-by-side facilities
            chunk = max(1, len(texts) // len(names))
            for i, name in enumerate(names):
                start = i * chunk
                end = start + chunk if i < len(names) - 1 else len(texts)
                desc = " ".join(texts[start:end]).strip()
                if desc:
                    result[name] = desc

    return result


def upload_image(sb, image_bytes: bytes, filename: str, content_type: str = "image/png") -> str | None:
    try:
        sb.storage.from_("facility-images").upload(
            filename, image_bytes,
            {"content-type": content_type, "upsert": "true"},
        )
        return sb.storage.from_("facility-images").get_public_url(filename)
    except Exception as e:
        # Try delete + re-upload if already exists
        try:
            sb.storage.from_("facility-images").remove([filename])
            sb.storage.from_("facility-images").upload(
                filename, image_bytes,
                {"content-type": content_type, "upsert": "true"},
            )
            return sb.storage.from_("facility-images").get_public_url(filename)
        except Exception as e2:
            print(f"    ⚠  Upload failed {filename}: {e2}")
            return None


def main():
    sb = create_client(SUPABASE_URL, KEY)

    for vid, (name, fac_url) in VENUES.items():
        print(f"\n🏫  {name}")

        resp = requests.get(fac_url, headers=UA, timeout=10)
        if resp.status_code != 200:
            print(f"  ⚠  Page {resp.status_code}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")

        # ── Logo ──────────────────────────────────────────────────────────────
        logo_src = extract_logo_url(soup)
        if logo_src:
            try:
                logo_bytes = requests.get(logo_src, headers=UA, timeout=10).content
                filename = f"logo_{vid[:8]}.png"
                public_url = upload_image(sb, logo_bytes, filename, "image/png")
                if public_url:
                    sb.table("venues").update({"logo_url": public_url}).eq("id", vid).execute()
                    print(f"  🖼  Logo uploaded")
            except Exception as e:
                print(f"  ⚠  Logo failed: {e}")
        else:
            print(f"  — No logo found")

        # ── Descriptions ──────────────────────────────────────────────────────
        descriptions = extract_descriptions(soup)

        fac_res = sb.table("facilities").select("id,name").eq("venue_id", vid).execute()
        db_facs = {f["name"].lower().strip(): f["id"] for f in (fac_res.data or [])}

        for fac_name, desc in descriptions.items():
            fac_key = fac_name.lower().strip()
            fac_id = db_facs.get(fac_key)
            if not fac_id:
                for dk, di in db_facs.items():
                    if fac_key in dk or dk in fac_key:
                        fac_id = di
                        break
            if fac_id:
                sb.table("facilities").update({"description": desc}).eq("id", fac_id).execute()
                print(f"  ✅  {fac_name}: {desc[:60]}…")
            else:
                print(f"  ⚠  {fac_name}: no DB match")

        time.sleep(0.4)

    print("\n✅  Done.")


if __name__ == "__main__":
    main()
