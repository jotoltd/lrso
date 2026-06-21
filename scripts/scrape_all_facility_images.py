#!/usr/bin/env python3
"""
Re-scrape ALL facility images (jpg + png) from each venue's facilities page.
Matches by vertical position pairing and uploads to Supabase storage.
Only updates facilities that don't already have an image_url.
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


def extract_pairs(soup: BeautifulSoup) -> list[tuple[str, str | None]]:
    """Return (facility_name, image_url|None).
    
    Images have their absolute page top in their own style attribute.
    Facility headings are in Heading_2_b divs whose page top is on the div itself.
    We sort both by top and match each facility to the nearest photo below it.
    """
    elements = []

    # Facility headings — top is on the Heading_2_b div
    for div in soup.find_all("div", class_=lambda c: c and "Heading_2_b" in c):
        top_m = re.search(r"top:\s*(-?\d+)px", div.get("style", ""))
        if not top_m:
            continue
        top = int(top_m.group(1))
        names = [h.get_text(" ", strip=True) for h in div.find_all("h2")
                 if h.get_text(strip=True) and len(h.get_text(strip=True)) < 80]
        if names:
            elements.append({"type": "fac", "top": top, "names": names})

    # Photos — top is in the img's own style
    for img in soup.find_all("img"):
        src = img.get("src", "")
        style = img.get("style", "")
        if "index_htm_files" not in src:
            continue
        top_m = re.search(r"top:\s*(\d+)px", style)
        wm = re.search(r"width:\s*(\d+)", style)
        hm = re.search(r"height:\s*(\d+)", style)
        if not top_m or not wm or not hm:
            continue
        top = int(top_m.group(1))
        w, h = int(wm.group(1)), int(hm.group(1))
        # Real facility photo: landscape, reasonable size, skip UI banners
        if w >= 200 and h >= 150 and w < 800:
            elements.append({"type": "img", "top": top, "src": f"{BASE}/{src}"})

    elements.sort(key=lambda x: x["top"])

    # Match: for each facility block, find photos between it and the next block
    fac_indices = [i for i, e in enumerate(elements) if e["type"] == "fac"]
    pairs = []

    for fi, fac_idx in enumerate(fac_indices):
        fac = elements[fac_idx]
        next_top = elements[fac_indices[fi + 1]]["top"] if fi + 1 < len(fac_indices) else 999999
        photos = [e for e in elements
                  if e["type"] == "img" and fac["top"] <= e["top"] < next_top]
        for i, name in enumerate(fac["names"]):
            pairs.append((name, photos[i]["src"] if i < len(photos) else None))

    return pairs


def upload(sb, img_bytes: bytes, filename: str, ext: str) -> str | None:
    ctype = "image/jpeg" if ext == "jpg" else "image/png"
    try:
        sb.storage.from_("facility-images").remove([filename])
    except Exception:
        pass
    try:
        sb.storage.from_("facility-images").upload(
            filename, img_bytes, {"content-type": ctype, "upsert": "true"}
        )
        return sb.storage.from_("facility-images").get_public_url(filename)
    except Exception as e:
        print(f"    ⚠  Upload failed {filename}: {e}")
        return None


def main():
    sb = create_client(SUPABASE_URL, KEY)

    for vid, (vname, fac_url) in VENUES.items():
        print(f"\n🏫  {vname}")

        resp = requests.get(fac_url, headers=UA, timeout=10)
        if resp.status_code != 200:
            print(f"  ⚠  {resp.status_code}")
            continue

        soup = BeautifulSoup(resp.content, "html.parser")
        pairs = extract_pairs(soup)

        if not pairs:
            print("  ⚠  No pairs found")
            continue

        # Fetch all facilities for this venue
        fac_res = sb.table("facilities").select("id,name,image_url").eq("venue_id", vid).execute()
        db_facs = {f["name"].lower().strip(): f for f in (fac_res.data or [])}

        for fac_name, img_url in pairs:
            if not img_url:
                print(f"  —  {fac_name}: no image on site")
                continue

            # Find DB facility
            fac_key = fac_name.lower().strip()
            fac = db_facs.get(fac_key)
            if not fac:
                for dk, df in db_facs.items():
                    if fac_key in dk or dk in fac_key:
                        fac = df
                        break

            if not fac:
                print(f"  ⚠  {fac_name}: no DB match")
                continue

            # Download
            try:
                img_resp = requests.get(img_url, headers=UA, timeout=15)
                img_resp.raise_for_status()
                img_bytes = img_resp.content
            except Exception as e:
                print(f"  ⚠  Download failed {img_url}: {e}")
                continue

            ext = "png" if img_url.endswith(".png") else "jpg"
            filename = f"{vid[:8]}_{fac_name[:30].replace(' ','_').replace('/','_')}.{ext}"
            public_url = upload(sb, img_bytes, filename, ext)

            if public_url:
                sb.table("facilities").update({"image_url": public_url}).eq("id", fac["id"]).execute()
                print(f"  ✅  {fac_name}")

        time.sleep(0.4)

    print("\n✅  Done.")


if __name__ == "__main__":
    main()
