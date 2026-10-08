import { useEffect } from "react";

interface PageMeta {
  /** Page <title> — pass null/undefined to leave unchanged (e.g. while loading) */
  title?: string | null;
  description?: string | null;
  /** Canonical path, e.g. "/venues" — defaults to current pathname */
  canonicalPath?: string | null;
  noindex?: boolean;
  ogImage?: string | null;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, canonicalPath, noindex, ogImage }: PageMeta) {
  useEffect(() => {
    const url = `${window.location.origin}${canonicalPath ?? window.location.pathname}`;

    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "LRSO");
    if (ogImage) {
      const img = ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`;
      setMeta("property", "og:image", img);
      setMeta("name", "twitter:image", img);
      setMeta("name", "twitter:card", "summary");
    }
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, canonicalPath, noindex, ogImage]);
}
