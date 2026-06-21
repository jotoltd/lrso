import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, ExternalLink, Loader2 } from "lucide-react";
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
  onBookClick: (venueName: string) => void;
  onVenueSelect: (venueId: string) => void;
}

export const VenueExplorer: React.FC<VenueExplorerProps> = ({ onBookClick: _onBookClick, onVenueSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<SupabaseVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const { data } = await supabase.from("venues").select("*").order("created_at", { ascending: true });
      if (data) setVenues(data as SupabaseVenue[]);
      setLoading(false);
    };
    fetchVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
    );
  }, [venues, searchQuery]);

  const resetFilters = () => setSearchQuery("");

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
              placeholder="Search by name, location or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base font-medium text-slate-800 placeholder-slate-400 focus:border-lrso-blue-600 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>
          {searchQuery && (
            <button onClick={resetFilters} className="mt-3 text-sm font-bold text-lrso-crimson-600 hover:underline cursor-pointer">
              Clear search
            </button>
          )}
        </div>
      </FadeIn>

      {/* Status row */}
      <div className="mb-6 flex items-center justify-between text-slate-500">
        <span className="text-base font-semibold">
          {loading ? "Loading venues…" : <><strong className="text-slate-900 font-bold">{filteredVenues.length}</strong> venue{filteredVenues.length !== 1 ? "s" : ""} available for hire</>}
        </span>
        <span className="text-sm font-semibold text-slate-400">Evenings, Weekends & School Holidays</span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* Venue Cards */}
      {!loading && filteredVenues.length > 0 && (
        <div id="venues-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
            >
              {/* Header banner with logo */}
              <div className="relative h-40 bg-gradient-to-br from-lrso-blue-800 to-slate-800 flex flex-col items-center justify-center gap-3 px-6">
                {venue.logo_url ? (
                  <img
                    src={venue.logo_url}
                    alt={`${venue.name} logo`}
                    className="h-16 w-16 rounded-2xl object-contain bg-white/10 p-1 border border-white/20"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-white/60">{venue.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-display text-base font-bold text-white text-center leading-tight">{venue.name}</span>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <p className="flex items-start gap-1.5 text-sm font-semibold text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {venue.address}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    onClick={() => onVenueSelect(venue.id)}
                    className="text-sm font-bold text-lrso-blue-600 hover:text-lrso-blue-800 transition-colors underline decoration-2 underline-offset-4 cursor-pointer"
                  >
                    View Facilities
                  </button>
                  <a
                    href={venue.book_link}
                    target="_blank"
                    rel="noopener noreferrer"
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
