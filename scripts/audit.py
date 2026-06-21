import requests, json

URL = "https://urjwjvjdtdibjmvouofh.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyandqdmpkdGRpYmptdm91b2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NDM4MDcsImV4cCI6MjA5NzMxOTgwN30.YT0OmvbEeGsQ3VUCFAWxmeZPOlD252hc7MY_JaPj9rM"
H = {"apikey": KEY, "Authorization": "Bearer " + KEY}

venues = requests.get(URL + "/rest/v1/venues?select=id,name,address,book_link&order=name", headers=H).json()
all_facs = requests.get(URL + "/rest/v1/facilities?select=venue_id,name,image_url", headers=H).json()

fac_map = {}
for f in all_facs:
    fac_map.setdefault(f["venue_id"], []).append(f)

total_facs = 0
total_imgs = 0
for v in venues:
    facs = fac_map.get(v["id"], [])
    imgs = [f for f in facs if f["image_url"]]
    total_facs += len(facs)
    total_imgs += len(imgs)
    issues = []
    if not v["address"]:    issues.append("no address")
    if not v["book_link"]:  issues.append("no book link")
    if not facs:            issues.append("no facilities")
    status = "OK" if not issues else "WARN: " + ", ".join(issues)
    print(f"[{status}]  {v['name']}  ({len(facs)} facilities, {len(imgs)} with images)")

print(f"\nTotals: {len(venues)} venues | {total_facs} facilities | {total_imgs} with images")
