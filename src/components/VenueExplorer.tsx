import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, ExternalLink, SlidersHorizontal } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { supabase } from "../lib/supabase";

interface SupabaseVenue {
  id: string;
  name: string;
  address: string;
  book_link: string;
  logo_url: string | null;
  created_at: string;
}

interface Facility {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

interface VenueExplorerProps {
  onVenueSelect: (venueId: string) => void;
}

export const VenueExplorer: React.FC<VenueExplorerProps> = ({ onVenueSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [venues, setVenues] = useState<SupabaseVenue[]>([]);
  const [venueFacilityNames, setVenueFacilityNames] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const { data } = await supabase.from("venues").select("*").order("name", { ascending: true });
      if (data) {
        setVenues(data as SupabaseVenue[]);
        // Also fetch all facility names for filtering
        const { data: facs } = await supabase.from("facilities").select("venue_id, name");
        if (facs) {
          const map: Record<string, string[]> = {};
          for (const f of facs) {
            if (!map[f.venue_id]) map[f.venue_id] = [];
            map[f.venue_id].push(f.name.toLowerCase());
          }
          setVenueFacilityNames(map);
        }
      }
      setLoading(false);
    };
    fetchVenues();
  }, []);

  const FILTERS = [
    { label: "3G Pitch",     match: "3g" },
    { label: "Sports Hall",  match: "sports hall" },
    { label: "Dance",        match: "dance" },
    { label: "Drama",        match: "drama" },
    { label: "Swimming",     match: "swimming" },
    { label: "Classrooms",   match: "classroom" },
    { label: "Netball",      match: "netball" },
  ];

  const filteredVenues = useMemo(() => {
    let result = venues;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) => v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q)
      );
    }
    if (activeFilter) {
      result = result.filter((v) =>
        (venueFacilityNames[v.id] || []).some((n) => n.includes(activeFilter))
      );
    }
    return result;
  }, [venues, searchQuery, activeFilter, venueFacilityNames]);

  const resetFilters = () => { setSearchQuery(""); setActiveFilter(""); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="venue-explorer-container">
      <FadeIn>
        <div className="mb-12 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-lrso-blue-600 bg-lrso-blue-50 border border-lrso-blue-100 px-4 py-2 rounded-full">
            Available Facilities
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Browse Our Venues For Hire
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto font-medium">
            We open outstanding educational sport complexes, halls, and classrooms to community groups, schools, sports clubs, and wellness providers.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-10 rounded-3xl bg-white p-6 border border-slate-200 shadow-xs lg:p-8">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base font-medium text-slate-800 placeholder-slate-400 focus:border-lrso-blue-600 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>
          {/* Facility type filter chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </span>
            {FILTERS.map((f) => (
              <button
                key={f.match}
                onClick={() => setActiveFilter(activeFilter === f.match ? "" : f.match)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                  activeFilter === f.match
                    ? "bg-lrso-blue-600 text-white border-lrso-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-lrso-blue-300 hover:text-lrso-blue-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            {(searchQuery || activeFilter) && (
              <button onClick={resetFilters} className="ml-auto text-xs font-bold text-lrso-crimson-600 hover:underline cursor-pointer">
                Clear all
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Status row */}
      <div className="mb-6 flex items-center justify-between text-slate-500">
        <span className="text-base font-semibold">
          {loading ? "Loading venues…" : <><strong className="text-slate-900 font-bold">{filteredVenues.length}</strong> venue{filteredVenues.length !== 1 ? "s" : ""} available for hire</>}
        </span>
        <span className="text-sm font-semibold text-slate-400">Evenings, Weekends & School Holidays</span>
      </div>

      {/* Skeleton loading */}
      {loading && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs animate-pulse">
              <div className="h-52 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  <div className="h-5 w-14 bg-slate-100 rounded-full" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venue Cards */}
      {!loading && filteredVenues.length > 0 && (
        <div id="venues-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              onClick={() => onVenueSelect(venue.id)}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-lrso-blue-200 transition-all duration-300 cursor-pointer"
            >
              {/* Header banner with logo */}
              <div className="relative h-52 bg-gradient-to-br from-lrso-blue-800 to-slate-800 flex items-center justify-center overflow-hidden">
                {venue.logo_url ? (
                  <img
                    src={venue.logo_url}
                    alt={`${venue.name} logo`}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-4xl font-display font-bold text-white/40">{venue.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 font-display text-base font-bold text-white leading-tight drop-shadow">{venue.name}</span>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <p className="flex items-start gap-1.5 text-sm font-semibold text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {venue.address}
                  </p>
                  {/* Facility tag pills */}
                  {venueFacilityNames[venue.id] && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Array.from(new Set(
                        venueFacilityNames[venue.id]
                          .map((n) => {
                            if (n.includes("3g") || n.includes("pitch") || n.includes("football")) return "3G Pitch";
                            if (n.includes("sports hall")) return "Sports Hall";
                            if (n.includes("dance")) return "Dance";
                            if (n.includes("drama")) return "Drama";
                            if (n.includes("swim") || n.includes("pool")) return "Pool";
                            if (n.includes("gym") || n.includes("fitness")) return "Gym";
                            if (n.includes("netball") || n.includes("tennis")) return "Courts";
                            if (n.includes("main hall")) return "Main Hall";
                            return null;
                          })
                          .filter(Boolean)
                      )).slice(0, 4).map((tag) => (
                        <span key={tag as string}
                          className="rounded-full bg-lrso-blue-50 border border-lrso-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-lrso-blue-700">
                          {tag as string}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-bold text-lrso-blue-600 group-hover:text-lrso-blue-800 transition-colors underline decoration-2 underline-offset-4">
                    View Facilities
                  </span>
                  <a
                    href={venue.book_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded-xl bg-lrso-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-lrso-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    Book Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredVenues.length === 0 && (
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            {venues.length === 0 ? "No venues listed yet" : "No venues match your search"}
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {venues.length === 0
              ? "Check back soon — we're adding new venues regularly."
              : "Try adjusting your search term."}
          </p>
          {searchQuery && (
            <button onClick={resetFilters} className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer">
              Clear Search
            </button>
          )}
        </div>
      )}

    </div>
  );
};
