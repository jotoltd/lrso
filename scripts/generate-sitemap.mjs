// Regenerates public/sitemap.xml with current venue slugs at build time.
// Runs via the "prebuild" npm script. If venue slugs can't be fetched
// (e.g. missing Supabase env vars), the existing sitemap is left untouched.
import "dotenv/config";
import { existsSync, writeFileSync } from "node:fs";

const BASE = "https://www.lrso.co.uk";
const supaUrl = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

const staticPaths = ["/", "/venues", "/contact", "/partnership"];

let venuePaths = [];
if (supaUrl && key) {
  try {
    const res = await fetch(`${supaUrl}/rest/v1/venues?select=slug&slug=not.is.null&order=name`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows = await res.json();
    if (Array.isArray(rows)) {
      venuePaths = rows.filter((r) => r.slug).map((r) => `/venues/${r.slug}`);
    }
  } catch (err) {
    console.warn("generate-sitemap: venue fetch failed:", err.message);
  }
}

if (!venuePaths.length && existsSync("public/sitemap.xml")) {
  console.warn("generate-sitemap: no venue slugs fetched — keeping existing sitemap.xml");
  process.exit(0);
}

const urls = [...staticPaths, ...venuePaths];
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((p) => `  <url><loc>${BASE}${p}</loc></url>`).join("\n") +
  "\n</urlset>\n";

writeFileSync("public/sitemap.xml", xml);
console.log(`generate-sitemap: wrote ${urls.length} URLs to public/sitemap.xml`);
