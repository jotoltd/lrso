#!/usr/bin/env python3
"""
Crawls lrso.co.uk venue pages and inserts all venues + facilities into Supabase.
Usage:
    pip install requests beautifulsoup4 supabase
    python scripts/crawl_venues.py
"""

import re
import time
import json
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# ── Supabase config ────────────────────────────────────────────────────────────
SUPABASE_URL = "https://urjwjvjdtdibjmvouofh.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyandqdmpkdGRpYmptdm91b2ZoIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM4MDcsImV4cCI6MjA5NzMxOTgwN30."
    "YT0OmvbEeGsQ3VUCFAWxmeZPOlD252hc7MY_JaPj9rM"
)

BASE = "https://www.lrso.co.uk"
VENUES_PAGE = f"{BASE}/our%20venues.htm"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
}


def get_soup(url: str) -> BeautifulSoup | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  ⚠  Failed to fetch {url}: {e}")
        return None


# Nav pages to skip entirely
SKIP_PAGES = {"index", "book%20now", "join%20us", "contact%20a", "book now", "join us", "contact"}

def discover_venue_pages(soup: BeautifulSoup) -> list[dict]:
    """Return list of {facilities_url, book_url} dicts for each venue."""
    fac_urls: list[str] = []
    book_urls: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith("#") or href.startswith("mailto"):
            continue
        full = href if href.startswith("http") else f"{BASE}/{href.lstrip('/')}"
        if "facilit" in href.lower() and full not in fac_urls:
            fac_urls.append(full)
        elif "book" in href.lower() and full not in book_urls:
            # Skip the generic "book now" page
            if "book%20now" not in href.lower() and "book now" not in href.lower():
                book_urls.append(full)

    # Pair them up in order
    pairs = []
    for i, furl in enumerate(fac_urls):
        burl = book_urls[i] if i < len(book_urls) else None
        pairs.append({"facilities_url": furl, "book_url": burl})
    return pairs


def get_bookteq_link(book_url: str) -> str | None:
    """Fetch the venue's book page and extract the Bookteq iframe src URL."""
    soup = get_soup(book_url)
    if not soup:
        return None
    # The site embeds Bookteq as an iframe: <iframe src=https://widget.bookteq.com/...>
    iframe = soup.find("iframe", id="bktqframe")
    if iframe and iframe.get("src"):
        return iframe["src"]
    # Fallback: any bookteq link
    for a in soup.find_all("a", href=True):
        if "bookteq" in a["href"].lower():
            return a["href"]
    return None


def parse_venue_page(url: str, book_url: str | None = None) -> dict | None:
    """Extract name, address, book_link, and facilities from a single venue page.
    
    The lrso.co.uk site uses absolute-positioned HTML from an old web builder.
    Facility names are in <h2> tags inside .Heading_2_b divs.
    The venue name is in <h1>, address/postcode is in Normal_text spans near the top.
    """
    soup = get_soup(url)
    if not soup:
        return None

    data: dict = {"url": url, "name": None, "address": None, "book_link": None, "facilities": []}

    # ── Name: first <h1> on the page ──────────────────────────────────────────
    h1 = soup.find("h1")
    if h1:
        data["name"] = h1.get_text(" ", strip=True)
    else:
        title = soup.find("title")
        if title:
            data["name"] = title.get_text(strip=True).split("|")[0].strip()

    # ── Address: find postcode in page text and grab surrounding context ───────
    full_text = soup.get_text(" ", strip=True)
    pc = re.search(r"[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}", full_text)
    if pc:
        start = max(0, pc.start() - 120)
        snippet = full_text[start:pc.end()]
        snippet = re.sub(r"\s+", " ", snippet).strip()
        # strip leading noise before first number/letter of address
        snippet = re.sub(r"^[^0-9A-Z]+", "", snippet)
        data["address"] = snippet

    # ── Facilities: all h2 elements inside Heading_2_b divs ───────────────────
    seen: set[str] = set()
    for div in soup.find_all("div", class_=lambda c: c and "Heading_2_b" in c):
        for h2 in div.find_all("h2"):
            name = h2.get_text(" ", strip=True)
            # Merge split h2 siblings (some facility names span 2 h2 tags)
            if name and name not in seen and len(name) < 80:
                seen.add(name)
                data["facilities"].append(name)

    # Fallback: any h2 not already captured
    if not data["facilities"]:
        for h2 in soup.find_all("h2"):
            name = h2.get_text(" ", strip=True)
            if name and name not in seen and len(name) < 80:
                seen.add(name)
                data["facilities"].append(name)

    # ── Book link: fetch from dedicated book page ──────────────────────────────
    if book_url:
        resolved = get_bookteq_link(book_url)
        if resolved:
            data["book_link"] = resolved

    return data


def insert_venue(sb: Client, venue: dict) -> str | None:
    """Insert a venue row and return its new UUID."""
    payload = {
        "name": venue["name"] or "Unknown Venue",
        "address": venue["address"] or "",
        "book_link": venue["book_link"] or "",
        "logo_url": None,
    }
    res = sb.table("venues").insert(payload).execute()
    if res.data:
        venue_id = res.data[0]["id"]
        print(f"  ✅  Inserted venue: {payload['name']} ({venue_id})")
        return venue_id
    else:
        print(f"  ❌  Failed to insert venue: {payload['name']} — {res}")
        return None


def insert_facilities(sb: Client, venue_id: str, facilities: list[str]):
    for i, name in enumerate(facilities):
        res = sb.table("facilities").insert({
            "venue_id": venue_id,
            "name": name,
            "sort_order": i,
        }).execute()
        if res.data:
            print(f"    + Facility: {name}")
        else:
            print(f"    ⚠  Failed facility: {name} — {res}")


def parse_venue_list_page(soup: BeautifulSoup) -> list[dict]:
    """Parse venue names and addresses from the main venues listing page.
    
    The page has repeating div blocks each containing:
      - <h2> with venue name
      - <span class="Normal_text_c"> lines for address
    We take only the clean blocks that appear after the navigation duplicates.
    """
    results = []
    seen_names: set[str] = set()
    
    for div in soup.find_all("div"):
        # Only process divs that have exactly one h2 (not wrapper divs with many)
        h2s = div.find_all("h2", recursive=False)
        all_h2s = div.find_all("h2")
        if len(all_h2s) != 1:
            continue
        h2 = all_h2s[0]
        name = h2.get_text(" ", strip=True)
        if not name or name in seen_names:
            continue
        # Only take direct-child spans (not deeply nested from other blocks)
        spans = [s for s in div.find_all("span", class_=lambda c: c and "Normal_text_c" in c)
                 if s.parent == div or s.parent.parent == div]
        lines = [s.get_text(strip=True) for s in spans if s.get_text(strip=True)]
        if not lines:
            continue
        seen_names.add(name)
        address = ", ".join(lines)
        results.append({"name": name, "address": address})
    
    return results


def main():
    sb: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    # ── Step 1: Parse names+addresses from the listing page ───────────────────
    print("🔍  Fetching venue listing page for names & addresses…")
    index_soup = get_soup(VENUES_PAGE)
    if not index_soup:
        print("❌  Could not load venues page. Exiting.")
        return

    venue_list = parse_venue_list_page(index_soup)
    print(f"📋  Found {len(venue_list)} venues on listing page:")
    for v in venue_list:
        print(f"  {v['name']} — {v['address']}")

    # ── Step 2: Patch existing DB venues with correct names and addresses ──────
    print("\n🔧  Patching addresses into Supabase…")
    existing = sb.table("venues").select("id,name").execute()
    if existing.data:
        for db_venue in existing.data:
            # Match by simplified name comparison
            db_name_lower = db_venue["name"].lower().replace("the ", "").strip()
            for v in venue_list:
                list_name_lower = v["name"].lower().replace("the ", "").strip()
                if db_name_lower in list_name_lower or list_name_lower in db_name_lower:
                    sb.table("venues").update({
                        "name": v["name"],
                        "address": v["address"],
                    }).eq("id", db_venue["id"]).execute()
                    print(f"  ✅ Patched: {v['name']} → {v['address']}")
                    break

    print("\n✅  Address patching complete.")
    return  # Don't re-run full scrape below unless needed

    print("🧹  Removing all existing venue entries…")
    existing = sb.table("venues").select("id").execute()
    if existing.data:
        ids = [v["id"] for v in existing.data]
        sb.table("venues").delete().in_("id", ids).execute()
        print(f"  Deleted {len(ids)} existing venues.")

    print("🔍  Fetching venues listing page…")
    index_soup = get_soup(VENUES_PAGE)
    if not index_soup:
        print("❌  Could not load venues page. Exiting.")
        return

    pairs = discover_venue_pages(index_soup)
    print(f"📋  Found {len(pairs)} venue pairs:")
    for p in pairs:
        print(f"  📄 {p['facilities_url']}  🔗 {p['book_url']}")

    if not pairs:
        print("⚠  No venue links found — the site may use JavaScript rendering.")
        print("   Dumping page HTML for inspection…")
        print(index_soup.prettify()[:3000])
        return

    results = []
    for pair in pairs:
        url = pair["facilities_url"]
        book_url = pair["book_url"]
        print(f"\n🏫  Parsing: {url}")
        venue = parse_venue_page(url, book_url)
        if not venue or not venue.get("name"):
            print("  ⚠  Skipping — could not parse name.")
            continue

        venue_id = insert_venue(sb, venue)
        if venue_id and venue["facilities"]:
            insert_facilities(sb, venue_id, venue["facilities"])

        results.append(venue)
        time.sleep(0.8)  # polite crawl delay

    # Save a local JSON snapshot for review
    out_path = "scripts/venues_scraped.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n💾  Saved scraped data to {out_path}")
    print(f"\n✅  Done — processed {len(results)} venues.")


if __name__ == "__main__":
    main()
