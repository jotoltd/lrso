#!/usr/bin/env python3
"""
Re-scrape ALL facility images (jpg + png) from each venue's facilities page.
Matches by vertical position pairing and uploads to Supabase storage.
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

    The original LRSO pages use a block layout: 2 (or 1) photos appear first,
    then 2 facility headings directly below them. Each photo block belongs to the
    facility block beneath it. We therefore group facilities by their vertical
    position, then assign the nearest photos above each block to the names in
    that block.
    """
    # Facility headings — one Heading_2_b div is one visual block. It may contain
    # multiple h2 headings (e.g. "Floodlit Netball, Courts").
    fac_blocks: list[tuple[int, list[str]]] = []
    for div in soup.find_all("div", class_=lambda c: c and "Heading_2_b" in c):
        top_m = re.search(r"top:\s*(-?\d+)px", div.get("style", ""))
        if not top_m:
            continue
        top = int(top_m.group(1))
        names = [h.get_text(" ", strip=True) for h in div.find_all("h2")
                 if h.get_text(strip=True) and len(h.get_text(strip=True)) < 80]
        if names:
            fac_blocks.append((top, names))

    # Photos — top is in the img's own style
    imgs: list[tuple[int, str]] = []
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
            imgs.append((top, f"{BASE}/{src}"))

    fac_blocks.sort(key=lambda x: x[0])
    imgs.sort()

    if not fac_blocks:
        return []

    # Group images into vertical blocks by exact top
    img_blocks: list[tuple[int, list[str]]] = []
    for top, src in imgs:
        if img_blocks and top == img_blocks[-1][0]:
            img_blocks[-1][1].append(src)
        else:
            img_blocks.append((top, [src]))

    # Assign each facility block the nearest image block(s) above it that haven't
    # already been consumed by a later facility block.
    pairs: list[tuple[str, str | None]] = []
    img_consumed = [False] * len(img_blocks)

    for bi, (fac_top, names) in enumerate(fac_blocks):
        # Images must be above this facility block
        eligible = [i for i, (top, _) in enumerate(img_blocks)
                    if top < fac_top and not img_consumed[i]]
        if not eligible:
            for name in names:
                pairs.append((name, None))
            continue

        # If there is an earlier facility block, only consume images above that block
        prev_fac_top = fac_blocks[bi - 1][0] if bi > 0 else -999999
        chosen = [i for i in eligible if img_blocks[i][0] > prev_fac_top]
        if not chosen:
            chosen = eligible

        # Use the closest image block(s) to the facility block.
        # Each image block may contain 2 photos (a pair), so flatten the chosen
        # images and take as many as there are facilities, or as many as available.
        chosen.sort(key=lambda i: img_blocks[i][0], reverse=True)
        flat_images: list[tuple[int, str]] = []
        for idx in chosen:
            for src in img_blocks[idx][1]:
                flat_images.append((img_blocks[idx][0], src))

        selected = flat_images[:len(names)]
        selected_idx = 0

        for i, name in enumerate(names):
            if selected_idx < len(selected):
                pairs.append((name, selected[selected_idx][1]))
                selected_idx += 1
            else:
                pairs.append((name, None))

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
