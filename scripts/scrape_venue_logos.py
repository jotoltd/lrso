#!/usr/bin/env python3
"""
Scrape proper venue logo cards from book%20now.htm and upload to Supabase.
Each logo image is linked to the venue's book page, which maps to a Bookteq URL
that we already have in the DB — so we match via book_link.
"""
import re, requests
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
UA = {"User-Agent": "Mozilla/5.0"}

# book page slug → venue book_link (Bookteq widget URL)
BOOK_PAGE_TO_BOOKTEQ = {
    "cws%20book.htm":        "https://widget.bookteq.com/lrso/book-online/41d1d499-f9e3-4d40-9651-fcbcd89daa89",
    "aspley%20book.htm":     "https://widget.bookteq.com/lrso/book-online/d36758a7-f3cd-414b-a534-5dbf514fe0ea",
    "beechdale%20book.htm":  "https://widget.bookteq.com/lrso/book-online/692e6467-0bbc-456d-aadb-e70a98790d86",
    "lees%20brook%20book.htm":"https://widget.bookteq.com/lrso/book-online/dfe8cc0a-61c3-44cc-80f3-0dffc510a411",
    "nott%20em%20book.htm":  "https://widget.bookteq.com/lrso/book-online/0c452d67-5693-449b-bc88-44d5ca1df454",
    "wcgs%20book.htm":       "https://widget.bookteq.com/lrso/book-online/9cae0a8d-ca48-4822-b604-3c1f387a9a2b",
    "westlea%20book.htm":    "https://widget.bookteq.com/lrso/book-online/6e4a836f-15c9-473b-80b6-9569b82c94fb",
    "wollaton%20book.htm":   "https://widget.bookteq.com/lrso/book-online/def38d83-b792-49ce-81fc-9e8c5ceeb6e1",
    "ia%20book.htm":         "https://widget.bookteq.com/lrso/book-online/a6fb381f-fd8d-4fa5-aadc-953a915ee7a1",
    "murray%20book.htm":     "https://widget.bookteq.com/lrso/book-online/78436bbc-cf69-46b3-ba4f-0b7d2cc34456",
    "pipers%20book.htm":     "https://widget.bookteq.com/lrso/book-online/78436bbc-cf69-46b3-ba4f-0b7d2cc34456",
    "woodbridge%20book.htm": "https://widget.bookteq.com/lrso/book-online/e7ab6b2e-1a83-4dd8-95f4-6b87f9517cb9",
    "trent%20book.htm":      "https://widget.bookteq.com/lrso/book-online/0d4bd2a4-8b01-412e-a9ee-0a68aadf45d0",
    "riddlesdown%20book.htm":"https://widget.bookteq.com/lrso/book-online/9376eff4-94a8-4ec4-a435-a476cc68f6fd",
}


def main():
    sb = create_client(SUPABASE_URL, KEY)

    # Build book_link → venue_id map from DB
    venues = sb.table("venues").select("id,name,book_link").execute().data
    booklink_to_venue = {v["book_link"]: v for v in venues}

    # Parse book now page
    r = requests.get(f"{BASE}/book%20now.htm", headers=UA, timeout=10)
    soup = BeautifulSoup(r.content, "html.parser")

    # Find all logo links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        imgs = a.find_all("img")
        logo_img = None
        for img in imgs:
            src = img.get("src", "")
            style = img.get("style", "")
            wm = re.search(r"width:\s*(\d+)", style)
            hm = re.search(r"height:\s*(\d+)", style)
            if wm and hm and 250 < int(wm.group(1)) < 320 and 300 < int(hm.group(1)) < 500:
                logo_img = src
                break
        if not logo_img:
            continue

        # Match to venue via book page slug → Bookteq URL → DB venue
        bookteq_url = BOOK_PAGE_TO_BOOKTEQ.get(href)
        if not bookteq_url:
            print(f"⚠  No Bookteq mapping for {href}")
            continue

        venue = booklink_to_venue.get(bookteq_url)
        if not venue:
            # Try partial match
            for bl, v in booklink_to_venue.items():
                if bl and bookteq_url in bl:
                    venue = v
                    break

        if not venue:
            print(f"⚠  No DB venue for {bookteq_url}")
            continue

        # Download logo
        logo_url = f"{BASE}/{logo_img}"
        img_bytes = requests.get(logo_url, headers=UA, timeout=10).content

        # Upload to Supabase storage
        filename = f"logo_{venue['id'][:8]}.png"
        try:
            sb.storage.from_("facility-images").remove([filename])
        except Exception:
            pass
        try:
            sb.storage.from_("facility-images").upload(
                filename, img_bytes, {"content-type": "image/png", "upsert": "true"}
            )
            public_url = sb.storage.from_("facility-images").get_public_url(filename)
            sb.table("venues").update({"logo_url": public_url}).eq("id", venue["id"]).execute()
            print(f"✅  {venue['name']}  →  {filename}")
        except Exception as e:
            print(f"❌  {venue['name']}: {e}")

    print("\n✅  Done.")


if __name__ == "__main__":
    main()
