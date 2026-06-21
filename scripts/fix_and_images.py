#!/usr/bin/env python3
"""Fix venue names in DB and upload all facility images."""

import re
import time
import requests
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

# id → (correct_name, address, facilities_page)
VENUES = {
    "371d9d2e-e6e7-429a-9b72-1d94a0c6155d": ("Bluecoat Aspley Academy",          "311 Aspley Lane, Nottingham, NG8 5GY",                         f"{BASE}/baa%20facilities.htm"),
    "7f080264-220f-42b6-8d0f-e6cd4ea207f8": ("Bluecoat Beechdale Academy",       "Harvey Road, Nottingham, NG8 3GP",                             f"{BASE}/bba%20facilities.htm"),
    "c8ed4948-ff5a-4d5c-aa71-f4d8bcf93f70": ("Bluecoat Trent Academy",           "Pelham Avenue, Nottingham, NG5 1AJ",                           f"{BASE}/trent%20facilities.htm"),
    "ba2ed891-a3c3-479e-85bc-ebe3aa2426b0": ("Bluecoat Wollaton Academy",        "Sutton Passeys Crescent, Nottingham, NG8 1EA",                 f"{BASE}/wollaton%20facilities.htm"),
    "40509ab3-6421-40f1-b412-c7e12cf67082": ("Coombe Wood School",               "30 Melville Avenue, South Croydon, CR2 7HY",                   f"{BASE}/cws%20facilities.htm"),
    "b5d6fa40-c11f-4869-a0e4-bc6d26708f00": ("Ipswich Academy",                  "Braziers Wood Road, Ipswich, IP3 0SP",                         f"{BASE}/lipswich%20ac%20facilities.htm"),
    "5e100163-de41-4186-86e3-467a2569bc26": ("Lees Brook Academy",               "Morley Road, Derby, DE21 4QX",                                 f"{BASE}/lees%20brook%20facilities.htm"),
    "420e1842-f122-4d79-a005-f661a8362c08": ("Murrayfield Primary",              "Nacton Road, Ipswich, IP3 9JL",                                f"{BASE}/murrayfield%20fqcilities.htm"),
    "8b1a1fa8-a87b-49d7-bd3a-a98118f6b7f4": ("The Nottingham Emmanuel School",   "Gresham Park Road, West Bridgford, Nottingham, NG2 7YF",       f"{BASE}/nes%20facilities.htm"),
    "e2aa5d16-cd79-4b78-8fcb-74a69ac0ec05": ("Piper's Vale Academy",             "Raeburn Road, Ipswich, IP3 0EW",                               f"{BASE}/pipers%20vale%20facilities.htm"),
    "673a5b89-b7b6-4b8e-af7e-8eae067bc93d": ("Riddlesdown Collegiate",           "Honister Heights, Purley, CR8 1EX",                            f"{BASE}/riddlesdown%20facilities.htm"),
    "add44364-51ef-4299-8a2d-6b7ce866369a": ("Wallington County Grammar School", "329 Croydon Road, Wallington, SM6 7PH",                        f"{BASE}/wcgs%20facilities.htm"),
    "b79f491b-c0ca-47fb-9986-5a7819887cdb": ("Westlea Primary School",           "Langstone Way, Swindon, SN5 7BT",                              f"{BASE}/westlea%20facilities.htm"),
    "41c975b8-17f8-4eaf-8134-981b5cd7adb5": ("Woodbridge Road Academy",          "50 Russet Road, Ipswich, IP4 2EB",                             f"{BASE}/woodbridge%20facilities.htm"),
}


def get_top(el) -> int:
    m = re.search(r"top:\s*(-?\d+)px", el.get("style", ""))
    return int(m.group(1)) if m else 999999


def extract_pairs(soup: BeautifulSoup) -> list[tuple[str, str | None]]:
    """Return (facility_name, image_url|None) pairs sorted by page position."""
    elements = []

    for div in soup.find_all("div", class_=lambda c: c and "Heading_2_b" in c):
        top = get_top(div)
        names = [h2.get_text(" ", strip=True) for h2 in div.find_all("h2")
                 if h2.get_text(strip=True) and len(h2.get_text(strip=True)) < 80]
        if names:
            elements.append({"type": "fac", "top": top, "names": names})

    for img in soup.find_all("img"):
        src = img.get("src", "")
        style = img.get("style", "")
        if "index_htm_files" not in src or src.endswith(".png"):
            continue
        w_m = re.search(r"width:\s*(\d+)px", style)
        h_m = re.search(r"height:\s*(\d+)px", style)
        w = int(w_m.group(1)) if w_m else 0
        h = int(h_m.group(1)) if h_m else 0
        if w > 800 or h < 100:
            continue
        elements.append({"type": "img", "top": get_top(img), "src": f"{BASE}/{src}"})

    elements.sort(key=lambda x: x["top"])

    pairs = []
    fac_indices = [i for i, e in enumerate(elements) if e["type"] == "fac"]
    for fi, fac_idx in enumerate(fac_indices):
        fac = elements[fac_idx]
        next_top = elements[fac_indices[fi + 1]]["top"] if fi + 1 < len(fac_indices) else 999999
        photos = [e for e in elements if e["type"] == "img" and fac["top"] <= e["top"] < next_top]
        for i, name in enumerate(fac["names"]):
            pairs.append((name, photos[i]["src"] if i < len(photos) else None))

    return pairs


def main():
    sb = create_client(SUPABASE_URL, KEY)

    # ── Step 1: Fix all venue names and addresses ─────────────────────────────
    print("🔧  Fixing venue names & addresses…")
    for vid, (name, address, _) in VENUES.items():
        r = sb.table("venues").update({"name": name, "address": address}).eq("id", vid).execute()
        print(f"  ✅  {name}")

    # ── Step 2: Scrape and upload facility images ──────────────────────────────
    print("\n📸  Scraping facility images…")
    for vid, (name, _, fac_url) in VENUES.items():
        print(f"\n🏫  {name}")

        resp = requests.get(fac_url, headers=UA, timeout=10)
        if resp.status_code != 200:
            print(f"  ⚠  Page returned {resp.status_code}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        pairs = extract_pairs(soup)

        # Fetch DB facilities for this venue
        fac_res = sb.table("facilities").select("id,name").eq("venue_id", vid).execute()
        db_facs = {f["name"].lower().strip(): f["id"] for f in (fac_res.data or [])}

        for fac_name, img_url in pairs:
            if not img_url:
                continue

            # Download
            try:
                img_resp = requests.get(img_url, headers=UA, timeout=15)
                img_resp.raise_for_status()
                img_bytes = img_resp.content
            except Exception as e:
                print(f"  ⚠  Download failed {img_url}: {e}")
                continue

            # Upload
            filename = f"{vid[:8]}_{fac_name[:30].replace(' ','_').replace('/','_')}.jpg"
            try:
                sb.storage.from_("facility-images").upload(
                    filename, img_bytes,
                    {"content-type": "image/jpeg", "upsert": "true"},
                )
                public_url = sb.storage.from_("facility-images").get_public_url(filename)
            except Exception as e:
                print(f"  ⚠  Upload failed {filename}: {e}")
                continue

            # Match facility in DB
            fac_key = fac_name.lower().strip()
            fac_id = db_facs.get(fac_key)
            if not fac_id:
                for dk, di in db_facs.items():
                    if fac_key in dk or dk in fac_key:
                        fac_id = di
                        break

            if fac_id:
                sb.table("facilities").update({"image_url": public_url}).eq("id", fac_id).execute()
                print(f"  ✅  {fac_name}")
            else:
                print(f"  ⚠  {fac_name}: uploaded but no DB match")

        time.sleep(0.5)

    print("\n✅  All done.")


if __name__ == "__main__":
    main()
