#!/usr/bin/env python3
"""
For each venue's facilities page on lrso.co.uk:
  1. Extract facility h2 names and photo img tags sorted by vertical position
  2. Match each facility to its nearest photo below it
  3. Download the photo
  4. Upload to Supabase storage (facility-images bucket)
  5. Update the facilities table with the image_url

Usage:
    python3 scripts/scrape_images.py
"""

import re
import time
import tempfile
import os
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

SUPABASE_URL = "https://urjwjvjdtdibjmvouofh.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyandqdmpkdGRpYmptdm91b2ZoIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM4MDcsImV4cCI6MjA5NzMxOTgwN30."
    "YT0OmvbEeGsQ3VUCFAWxmeZPOlD252hc7MY_JaPj9rM"
)
BASE = "https://www.lrso.co.uk"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

# Venue name (as stored in DB) → facilities page URL
VENUE_PAGES = {
    "Coombe Wood School":              f"{BASE}/cws%20facilities.htm",
    "Westlea Primary School":          f"{BASE}/westlea%20facilities.htm",
    "Lees Brook Academy":              f"{BASE}/lees%20brook%20facilities.htm",
    "Bluecoat Aspley Academy":         f"{BASE}/baa%20facilities.htm",
    "Bluecoat Beechdale Academy":      f"{BASE}/bba%20facilities.htm",
    "Bluecoat Wollaton Academy":       f"{BASE}/wollaton%20facilities.htm",
    "The Nottingham Emmanuel School":  f"{BASE}/nes%20facilities.htm",
    "Riddlesdown Collegiate":          f"{BASE}/riddlesdown%20facilities.htm",
    "Ipswich Academy":                 f"{BASE}/lipswich%20ac%20facilities.htm",
    "Murrayfield Primary":             f"{BASE}/murrayfield%20fqcilities.htm",
    "Piper's Vale Academy":            f"{BASE}/pipers%20vale%20facilities.htm",
    "Woodbridge Road Academy":         f"{BASE}/woodbridge%20facilities.htm",
    "Bluecoat Trent Academy":          f"{BASE}/trent%20facilities.htm",
    "Wallington County Grammar School":f"{BASE}/wcgs%20facilities.htm",
}


def get_top(el) -> int:
    style = el.get("style", "")
    m = re.search(r"top:\s*(-?\d+)px", style)
    return int(m.group(1)) if m else 999999


def extract_positioned_elements(soup: BeautifulSoup) -> list[dict]:
    """Return sorted list of {type, top, name/src} for facilities and photos."""
    elements = []

    # Facility headings from Heading_2_b divs
    for div in soup.find_all("div", class_=lambda c: c and "Heading_2_b" in c):
        top = get_top(div)
        names = []
        for h2 in div.find_all("h2"):
            n = h2.get_text(" ", strip=True)
            if n and len(n) < 80:
                names.append(n)
        if names:
            elements.append({"type": "fac", "top": top, "names": names})

    # Photos — only actual content jpgs (not UI pngs)
    for img in soup.find_all("img"):
        src = img.get("src", "")
        alt = img.get("alt", "")
        style = img.get("style", "")
        if not src or ("index_htm_files" not in src):
            continue
        # Skip UI elements: navigation buttons, logos (usually .png or have alt text)
        if src.endswith(".png"):
            continue
        # Skip images that are very wide (full-width banners) or very short
        w_m = re.search(r"width:\s*(\d+)px", style)
        h_m = re.search(r"height:\s*(\d+)px", style)
        w = int(w_m.group(1)) if w_m else 0
        h = int(h_m.group(1)) if h_m else 0
        if w > 800 or h < 100:
            continue
        top = get_top(img)
        full_url = f"{BASE}/{src}"
        elements.append({"type": "img", "top": top, "src": full_url})

    elements.sort(key=lambda x: x["top"])
    return elements


def match_facilities_to_images(elements: list[dict]) -> list[tuple[str, str | None]]:
    """
    For each facility heading, find the nearest photo that appears below it
    (before the next facility heading). Returns list of (facility_name, image_url|None).
    """
    pairs = []
    fac_indices = [i for i, e in enumerate(elements) if e["type"] == "fac"]

    for fi, fac_idx in enumerate(fac_indices):
        fac = elements[fac_idx]
        next_fac_top = elements[fac_indices[fi + 1]]["top"] if fi + 1 < len(fac_indices) else 999999

        # Find photos between this facility and the next
        photos_between = [
            e for e in elements
            if e["type"] == "img"
            and fac["top"] <= e["top"] < next_fac_top
        ]

        # Each facility block has 2 facilities side-by-side and 2 photos below
        names = fac["names"]
        for i, name in enumerate(names):
            img_url = photos_between[i]["src"] if i < len(photos_between) else None
            pairs.append((name, img_url))

    return pairs


def download_image(url: str) -> bytes | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.content
    except Exception as e:
        print(f"    ⚠  Download failed {url}: {e}")
        return None


def upload_to_supabase(sb: Client, image_bytes: bytes, filename: str) -> str | None:
    try:
        res = sb.storage.from_("facility-images").upload(
            filename,
            image_bytes,
            {"content-type": "image/jpeg", "upsert": "true"},
        )
        return sb.storage.from_("facility-images").get_public_url(filename)
    except Exception as e:
        print(f"    ⚠  Upload failed {filename}: {e}")
        return None


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    # Fetch all venues from DB
    venues_res = sb.table("venues").select("id,name").execute()
    venue_map = {v["name"]: v["id"] for v in venues_res.data}

    for venue_name, fac_page_url in VENUE_PAGES.items():
        venue_id = venue_map.get(venue_name)
        if not venue_id:
            print(f"\n⚠  Venue not found in DB: {venue_name}")
            continue

        print(f"\n🏫  {venue_name}")
        r = requests.get(fac_page_url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            print(f"  ⚠  Could not fetch page ({r.status_code})")
            continue

        soup = BeautifulSoup(r.text, "html.parser")
        elements = extract_positioned_elements(soup)
        pairs = match_facilities_to_images(elements)

        if not pairs:
            print("  ⚠  No facility/image pairs found")
            continue

        # Fetch existing facilities for this venue from DB
        fac_res = sb.table("facilities").select("id,name").eq("venue_id", venue_id).order("sort_order").execute()
        db_facs = {f["name"].lower().strip(): f["id"] for f in (fac_res.data or [])}

        for fac_name, img_url in pairs:
            if not img_url:
                print(f"  — {fac_name}: no image")
                continue

            # Download image
            img_bytes = download_image(img_url)
            if not img_bytes:
                continue

            # Upload to Supabase storage
            filename = f"{venue_id[:8]}_{fac_name[:30].replace(' ','_').replace('/','_')}.jpg"
            public_url = upload_to_supabase(sb, img_bytes, filename)
            if not public_url:
                continue

            # Match to DB facility (fuzzy name match)
            fac_key = fac_name.lower().strip()
            fac_id = db_facs.get(fac_key)

            # Try partial match if exact fails
            if not fac_id:
                for db_key, db_id in db_facs.items():
                    if fac_key in db_key or db_key in fac_key:
                        fac_id = db_id
                        break

            if fac_id:
                sb.table("facilities").update({"image_url": public_url}).eq("id", fac_id).execute()
                print(f"  ✅  {fac_name} → {public_url[-50:]}")
            else:
                print(f"  ⚠  {fac_name}: no matching DB facility (image uploaded but not linked)")

        time.sleep(0.5)

    print("\n✅  Done.")


if __name__ == "__main__":
    main()
