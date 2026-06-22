import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface SiteContentItem {
  id: string;
  key: string;
  page: string;
  label: string;
  content: string;
  image_url: string | null;
  updated_at: string;
}

export function useSiteContent() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("site_content")
      .select("*")
      .order("page", { ascending: true })
      .order("label", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const value = (key: string, fallback = ""): string => {
    return items.find((i) => i.key === key)?.content ?? fallback;
  };

  const image = (key: string): string | null | undefined => {
    return items.find((i) => i.key === key)?.image_url;
  };

  const byPage = (page: string): SiteContentItem[] => {
    return items.filter((i) => i.page === page);
  };

  const refresh = fetchItems;

  return { items, value, image, byPage, loading, error, refresh };
}
