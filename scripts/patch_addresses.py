import requests
from bs4 import BeautifulSoup

SUPABASE_URL = "https://urjwjvjdtdibjmvouofh.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyandqdmpkdGRpYmptdm91b2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM4MDcsImV4cCI6MjA5NzMxOTgwN30.YT0OmvbEeGsQ3VUCFAWxmeZPOlD252hc7MY_JaPj9rM"
H = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

updates = [
    ("371d9d2e-e6e7-429a-9b72-1d94a0c6155d", "Bluecoat Aspley Academy",          "311 Aspley Lane, Nottingham, NG8 5GY"),
    ("7f080264-220f-42b6-8d0f-e6cd4ea207f8", "Bluecoat Beechdale Academy",       "Harvey Road, Nottingham, NG8 3GP"),
    ("c8ed4948-ff5a-4d5c-aa71-f4d8bcf93f70", "Bluecoat Trent Academy",           "Pelham Avenue, Nottingham, NG5 1AJ"),
    ("ba2ed891-a3c3-479e-85bc-ebe3aa2426b0", "Bluecoat Wollaton Academy",        "Sutton Passeys Crescent, Nottingham, NG8 1EA"),
    ("40509ab3-6421-40f1-b412-c7e12cf67082", "Coombe Wood School",               "30 Melville Avenue, South Croydon, CR2 7HY"),
    ("b5d6fa40-c11f-4869-a0e4-bc6d26708f00", "Ipswich Academy",                  "Braziers Wood Road, Ipswich, IP3 0SP"),
    ("5e100163-de41-4186-86e3-467a2569bc26", "Lees Brook Academy",               "Morley Road, Derby, DE21 4QX"),
    ("8b1a1fa8-a87b-49d7-bd3a-a98118f6b7f4", "The Nottingham Emmanuel School",   "Gresham Park Road, West Bridgford, Nottingham, NG2 7YF"),
    ("e2aa5d16-cd79-4b78-8fcb-74a69ac0ec05", "Piper's Vale Academy",             "Raeburn Road, Ipswich, IP3 0EW"),
    ("673a5b89-b7b6-4b8e-af7e-8eae067bc93d", "Riddlesdown Collegiate",           "Honister Heights, Purley, CR8 1EX"),
    ("add44364-51ef-4299-8a2d-6b7ce866369a", "Wallington County Grammar School", "329 Croydon Road, Wallington, SM6 7PH"),
    ("b79f491b-c0ca-47fb-9986-5a7819887cdb", "Westlea Primary School",           "Langstone Way, Swindon, SN5 7BT"),
    ("41c975b8-17f8-4eaf-8134-981b5cd7adb5", "Woodbridge Road Academy",          "50 Russet Road, Ipswich, IP4 2EB"),
]

for vid, name, address in updates:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/venues?id=eq.{vid}",
        json={"name": name, "address": address},
        headers=H,
    )
    icon = "✅" if r.status_code in (200, 204) else f"❌ {r.status_code}"
    print(f"{icon}  {name}")

# Insert missing Murrayfield Primary
murray_page = requests.get(
    "https://www.lrso.co.uk/murray%20book.htm",
    headers={"User-Agent": "Mozilla/5.0"},
    timeout=10,
)
murray_soup = BeautifulSoup(murray_page.text, "html.parser")
iframe = murray_soup.find("iframe", id="bktqframe")
book_link = iframe["src"] if iframe else ""

r = requests.post(
    f"{SUPABASE_URL}/rest/v1/venues",
    json={
        "name": "Murrayfield Primary",
        "address": "Nacton Road, Ipswich, IP3 9JL",
        "book_link": book_link,
        "logo_url": None,
    },
    headers={**H, "Prefer": "return=representation"},
)
if r.status_code in (200, 201):
    print(f"✅  Inserted Murrayfield Primary  (book_link: {book_link})")
else:
    print(f"❌  Murrayfield insert failed: {r.status_code} {r.text}")
