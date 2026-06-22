import React, { createContext, useContext, useEffect, useState } from "react";
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

interface SiteContentContextType {
  items: SiteContentItem[];
  value: (key: string, fallback?: string) => string;
  image: (key: string) => string | null | undefined;
  byPage: (page: string) => SiteContentItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsert: (key: string, updates: Partial<SiteContentItem>) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const upsert = async (key: string, updates: Partial<SiteContentItem>) => {
    const { error: err } = await supabase.from("site_content").upsert(
      { key, ...updates },
      { onConflict: "key" }
    );
    if (err) throw err;
    await fetchItems();
  };

  return (
    <SiteContentContext.Provider value={{ items, value, image, byPage, loading, error, refresh: fetchItems, upsert }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
};
