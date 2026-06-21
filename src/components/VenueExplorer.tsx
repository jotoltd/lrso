import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, MapPin, CheckCircle2, ShieldCheck, Mail, ExternalLink, X, Loader2 } from "lucide-react";
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
}

export const VenueExplorer: React.FC<VenueExplorerProps> = ({ onBookClick: _onBookClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<SupabaseVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVenue, setActiveVenue] = useState<SupabaseVenue | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const { data } = await supabase.from("venues").select("*").order("created_at", { ascending: true });
      if (data) setVenues(data as SupabaseVenue[]);
      setLoading(false);
    };
    fetchVenues();
  }, []);

  const openVenue = useCallback(async (venue: SupabaseVenue) => {
    setActiveVenue(venue);
    setFacilities([]);
    setLoadingFacilities(true);
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("venue_id", venue.id)
      .order("sort_order", { ascending: true });
    if (error) { console.error("Facility fetch error:", error); }
    if (data) setFacilities(data as Facility[]);
    setLoadingFacilities(false);
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
                    onClick={() => openVenue(venue)}
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

      {/* Detail Modal */}
      {activeVenue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-[250ms]"
          onClick={() => setActiveVenue(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-lrso-blue-800 to-slate-800 px-6 py-5 flex items-center gap-4">
              {activeVenue.logo_url ? (
                <img src={activeVenue.logo_url} alt={`${activeVenue.name} logo`} className="h-14 w-14 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-display font-bold text-white/60">{activeVenue.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl font-bold text-white leading-tight">{activeVenue.name}</h3>
                <p className="text-sm text-white/70 mt-0.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{activeVenue.address}</p>
              </div>
              <button onClick={() => setActiveVenue(null)} className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors cursor-pointer shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Safeguarding banner */}
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span><strong>DBS Safeguarding Guaranteed.</strong> Fully managed by security-cleared LRSO Supervisors.</span>
              </div>

              {/* Facility cards */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Available Facilities — click to book</h4>
              {loadingFacilities ? (
                <div className="flex items-center justify-center py-6 mb-6">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  {facilities.map((fac) => (
                    <a
                      key={fac.id}
                      href={activeVenue.book_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-lrso-blue-50 hover:border-lrso-blue-200 p-3 transition-all cursor-pointer"
                    >
                      {fac.image_url ? (
                        <img src={fac.image_url} alt={fac.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-lrso-blue-700 block truncate">{fac.name}</span>
                        {fac.description && <span className="text-xs text-slate-500 block truncate">{fac.description}</span>}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-lrso-blue-500 shrink-0" />
                    </a>
                  ))}
                  {facilities.length === 0 && !loadingFacilities && (
                    <p className="text-sm text-slate-400 col-span-full text-center py-4">No facilities listed for this venue yet.</p>
                  )}
                </div>
              )}

              {/* Email enquiry fallback */}
              <a
                href={`mailto:enquiries@lrso.co.uk?subject=Facility Enquiry at ${activeVenue.name}`}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 hover:bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                Email an Enquiry
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
