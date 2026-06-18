import React, { useState, useMemo } from "react";
import { VENUES, Venue } from "../data/venues";
import { Search, MapPin, CheckCircle2, ShieldCheck, Mail, Calendar, ArrowRight, X, AlertCircle } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { LazyImage } from "./LazyImage";

interface VenueExplorerProps {
  onBookClick: (venueName: string) => void;
}

export const VenueExplorer: React.FC<VenueExplorerProps> = ({ onBookClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [filter3G, setFilter3G] = useState(false);
  const [filterSportsHall, setFilterSportsHall] = useState(false);
  const [filterDanceStudio, setFilterDanceStudio] = useState(false);
  const [filterClassrooms, setFilterClassrooms] = useState(false);
  const [activeVenueDetails, setActiveVenueDetails] = useState<Venue | null>(null);

  // Get list of regions for filtering
  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(VENUES.map((v) => v.region)))];
  }, []);

  // Filter venues based on all query selectors
  const filteredVenues = useMemo(() => {
    return VENUES.filter((venue) => {
      // Search text match
      const matchesSearch =
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.postcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.facilities.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      // Region match
      const matchesRegion = selectedRegion === "All" || venue.region === selectedRegion;

      // Amenity filters
      const matches3G = !filter3G || venue.has3g;
      const matchesSportsHall = !filterSportsHall || venue.hasSportsHall;
      const matchesDanceStudio = !filterDanceStudio || venue.hasDanceStudio;
      const matchesClassrooms = !filterClassrooms || venue.hasClassrooms;

      return matchesSearch && matchesRegion && matches3G && matchesSportsHall && matchesDanceStudio && matchesClassrooms;
    });
  }, [searchQuery, selectedRegion, filter3G, filterSportsHall, filterDanceStudio, filterClassrooms]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setFilter3G(false);
    setFilterSportsHall(false);
    setFilterDanceStudio(false);
    setFilterClassrooms(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="venue-explorer-container">
      {/* Title & Introduction */}
      <FadeIn>
      <div className="mb-12 text-center">
        <span className="text-sm font-bold uppercase tracking-wider text-lrso-blue-600 bg-lrso-blue-50 border border-lrso-blue-100 px-4 py-2 rounded-full">
          Available Facilities
        </span>
        <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Browse Our Venues For Hire
        </h2>
        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto font-medium">
          We open outstanding educational sport complexes, halls, and classrooms to community groups, schools, sports clubs, and wellness providers. Search and filter below.
        </p>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
      {/* Interactive Controls Panel */}
      <div className="mb-10 rounded-3xl bg-white p-6 border border-slate-200 shadow-xs lg:p-8">
        <div className="grid gap-6 md:grid-cols-12">
          
          {/* Text Search Box */}
          <div className="relative md:col-span-6">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search by school, location, facility, postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base font-medium text-slate-800 placeholder-slate-400 focus:border-lrso-blue-600 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          {/* Region Tabs Dropdown/Pills */}
          <div className="md:col-span-6 flex flex-wrap gap-2.5 items-center">
            <span className="text-sm font-bold text-slate-500 uppercase mr-1">Region</span>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`rounded-xl px-5 py-2 text-sm font-bold border transition-all cursor-pointer ${
                  selectedRegion === region
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {region === "Croydon/London" ? "Croydon & London" : region}
              </button>
            ))}
          </div>
        </div>

        {/* Amenity Feature Badges Toggles */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <span className="text-sm font-bold text-slate-500 uppercase mr-1">Filter Features</span>
          
          <button
            onClick={() => setFilter3G(!filter3G)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
              filter3G
                ? "bg-emerald-50 text-emerald-700 border-emerald-400"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filter3G ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            3G Football Pitch
          </button>

          <button
            onClick={() => setFilterSportsHall(!filterSportsHall)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
              filterSportsHall
                ? "bg-lrso-blue-50 text-lrso-blue-700 border-lrso-blue-300"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterSportsHall ? "bg-lrso-blue-500 animate-pulse" : "bg-slate-300"}`} />
            Sports Hall
          </button>

          <button
            onClick={() => setFilterDanceStudio(!filterDanceStudio)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
              filterDanceStudio
                ? "bg-lrso-crimson-50 text-lrso-crimson-700 border-lrso-crimson-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterDanceStudio ? "bg-lrso-crimson-500 animate-pulse" : "bg-slate-300"}`} />
            Dance Studio
          </button>

          <button
            onClick={() => setFilterClassrooms(!filterClassrooms)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all cursor-pointer ${
              filterClassrooms
                ? "bg-slate-100 text-slate-800 border-slate-300"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterClassrooms ? "bg-indigo-500 animate-pulse" : "bg-slate-300"}`} />
            Classrooms & Halls
          </button>

          {(searchQuery || selectedRegion !== "All" || filter3G || filterSportsHall || filterDanceStudio || filterClassrooms) && (
            <button
              onClick={resetFilters}
              id="reset-filters"
              className="ml-auto text-sm font-bold text-lrso-crimson-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      </FadeIn>

      {/* Results Quantity Label */}
      <div className="mb-6 flex items-center justify-between text-slate-500">
        <span className="text-base font-semibold">
          Showing <strong className="text-slate-900 font-bold">{filteredVenues.length}</strong> venues available for booking
        </span>
        <span className="text-sm font-semibold text-slate-400">Evenings, Weekends & School Holidays</span>
      </div>

      {/* Venue Cards Grid */}
      {filteredVenues.length > 0 ? (
        <div id="venues-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              id={`venue-card-${venue.id}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
            >
              {/* Image Banner */}
              <div className="relative h-56 overflow-hidden">
                <LazyImage
                  src={venue.image}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                
                {/* Region Ribbon Tag */}
                <span className="absolute top-4 left-4 rounded-xl bg-slate-900/95 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md">
                  {venue.region}
                </span>
 
                {/* Facilities Badges overlay bottom */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                  {venue.has3g && (
                    <span className="rounded-md bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white tracking-wide backdrop-blur-xs">
                      Floodlit 3G
                    </span>
                  )}
                  {venue.hasSportsHall && (
                    <span className="rounded-md bg-lrso-blue-600/90 px-2.5 py-1 text-[10px] font-bold text-white tracking-wide backdrop-blur-xs">
                      Sports Hall
                    </span>
                  )}
                  {venue.hasDanceStudio && (
                    <span className="rounded-md bg-lrso-crimson-600/90 px-2.5 py-1 text-[10px] font-bold text-white tracking-wide backdrop-blur-xs">
                      Dance Studio
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 group-hover:text-lrso-blue-600 transition-colors">
                    {venue.name}
                  </h3>
                  
                  {/* Location Info */}
                  <p className="mt-2.5 flex items-start gap-1.5 text-sm font-semibold text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      {venue.address}, <strong className="font-bold text-slate-700">{venue.postcode}</strong>
                    </span>
                  </p>

                  {/* Summary / Facilities List */}
                  <div className="mt-5">
                    <span className="text-xs font-bold text-slate-400 tracking-wide block mb-2">
                      Features Available
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.facilities.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="rounded-lg bg-slate-50 px-2.5 py-1 text-sm font-semibold text-slate-600 border border-slate-100"
                        >
                          {f}
                        </span>
                      ))}
                      {venue.facilities.length > 4 && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-500">
                          +{venue.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    onClick={() => setActiveVenueDetails(venue)}
                    id={`view-facilities-btn-${venue.id}`}
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors underline decoration-2 underline-offset-4 flex items-center gap-1 cursor-pointer"
                  >
                    View Facilities
                  </button>
                  <button
                    onClick={() => onBookClick(venue.name)}
                    id={`book-btn-${venue.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-lrso-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-lrso-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">No venues match your search</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or searching for a different location, facility, or postcode.
          </p>
          <button
            onClick={resetFilters}
            id="empty-clear-filters"
            className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* IMMERSIVE MODAL DRAWER FOR DETAILED VENUE */}
      {activeVenueDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-[250ms]"
          onClick={() => setActiveVenueDetails(null)}
          id="venue-modal-overlay"
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            id={`venue-modal-${activeVenueDetails.id}`}
          >
            {/* Header image banner */}
            <div className="relative h-64">
              <LazyImage
                src={activeVenueDetails.image}
                alt={activeVenueDetails.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={() => setActiveVenueDetails(null)}
                id="close-venue-modal"
                className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors select-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title overlay */}
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <span className="rounded-md bg-lrso-crimson-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {activeVenueDetails.region} Partner
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">
                  {activeVenueDetails.name}
                </h3>
              </div>
            </div>

            {/* Modal Body Info Container */}
            <div className="p-6">
              {/* Safeguarding credentials banner */}
              <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>DBS Safeguarding Guaranteed:</strong> Fully managed by security-cleared LRSO Supervisors from opening to lockout.
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed mb-8 font-medium">
                {activeVenueDetails.description}
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Specific features available */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Available Lettings</h4>
                  <ul className="space-y-2.5">
                    {activeVenueDetails.facilities.map((fac) => (
                      <li key={fac} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-lrso-blue-600 shrink-0" />
                        {fac}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Booking & directions panel */}
                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">Location & Booking</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    <strong>Address:</strong> {activeVenueDetails.address}, <strong className="font-bold text-slate-800">{activeVenueDetails.postcode}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mb-5 font-mono">
                    System Powered by: <strong>Bookteq</strong>
                  </p>

                  <div className="space-y-3 mt-4">
                    <button
                      onClick={() => {
                        onBookClick(activeVenueDetails.name);
                        setActiveVenueDetails(null);
                      }}
                      id="modal-request-booking-btn"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 py-3.5 text-sm font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                      Request Booking Slot
                    </button>
                    <a
                      href={`mailto:enquiries@lrso.co.uk?subject=Facility Enquiry at ${activeVenueDetails.name}`}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 hover:bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      Email Office Enquiry
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
