import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Mail,
  Loader2,
  Dumbbell,
  Music,
  Drama,
  Footprints,
  Waves,
  BookOpen,
  Circle,
  Trees,
  UtensilsCrossed,
  Presentation,
  Clock,
  Navigation,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Venue {
  id: string;
  name: string;
  address: string;
  book_link: string;
  logo_url: string | null;
}

interface Facility {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

interface VenuePageProps {
  venueId: string;
  onBack: () => void;
  onEnquire: (subject: string) => void;
}

function facilityIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("sport") || n.includes("gym") || n.includes("fitness")) return <Dumbbell className="h-4 w-4" />;
  if (n.includes("dance") || n.includes("studio")) return <Music className="h-4 w-4" />;
  if (n.includes("drama") || n.includes("theatre") || n.includes("lecture")) return <Presentation className="h-4 w-4" />;
  if (n.includes("pitch") || n.includes("football") || n.includes("3g") || n.includes("muga")) return <Footprints className="h-4 w-4" />;
  if (n.includes("swim") || n.includes("pool")) return <Waves className="h-4 w-4" />;
  if (n.includes("class") || n.includes("room") || n.includes("meeting")) return <BookOpen className="h-4 w-4" />;
  if (n.includes("netball") || n.includes("tennis") || n.includes("court")) return <Circle className="h-4 w-4" />;
  if (n.includes("grass") || n.includes("garden") || n.includes("outdoor")) return <Trees className="h-4 w-4" />;
  if (n.includes("hall") || n.includes("atrium") || n.includes("dining")) return <UtensilsCrossed className="h-4 w-4" />;
  if (n.includes("chapel") || n.includes("worship")) return <Drama className="h-4 w-4" />;
  return <Dumbbell className="h-4 w-4" />;
}

export const VenuePage: React.FC<VenuePageProps> = ({ venueId, onBack, onEnquire }) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [venue]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetch = async () => {
      setLoading(true);
      const [{ data: v }, { data: f }] = await Promise.all([
        supabase.from("venues").select("*").eq("id", venueId).single(),
        supabase.from("facilities").select("*").eq("venue_id", venueId).order("sort_order", { ascending: true }),
      ]);
      if (v) {
        setVenue(v as Venue);
        document.title = `${(v as Venue).name} – LRSO`;
      }
      if (f) setFacilities(f as Facility[]);
      setLoading(false);
    };
    fetch();
    return () => { document.title = "LRSO – School Facility Hire"; };
  }, [venueId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-500 font-semibold">Venue not found.</p>
        <button onClick={onBack} className="text-lrso-blue-600 font-bold underline cursor-pointer">Back to venues</button>
      </div>
    );
  }

  const heroBg = facilities.find((f) => f.image_url)?.image_url ?? null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky book bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md transition-all duration-300 ${
        stickyVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}>
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {venue?.logo_url && (
              <img src={venue.logo_url} alt="" className="h-8 w-8 rounded-lg object-contain bg-slate-100 p-0.5 shrink-0" />
            )}
            <span className="font-display font-bold text-slate-900 truncate text-sm">{venue?.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onEnquire(`Enquiry about ${venue!.name}`)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              <Mail className="h-3.5 w-3.5" /> Enquire
            </button>
            <a href={venue?.book_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-lrso-blue-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-lrso-blue-700 transition-all shadow-sm">
              Book Now <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero — blurred facility photo backdrop */}
      <div ref={heroRef} className="relative overflow-hidden px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        {/* Blurred background image */}
        {heroBg ? (
          <img src={heroBg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover scale-110 blur-sm brightness-[0.35]" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-lrso-blue-900 via-lrso-blue-800 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-lrso-blue-900/60" />

        <div className="relative mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            All Venues
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {venue.logo_url ? (
              <img src={venue.logo_url} alt={`${venue.name} logo`} className="h-36 w-28 rounded-2xl object-contain bg-white/10 border border-white/20 p-2 shrink-0" />
            ) : (
              <div className="h-36 w-28 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <span className="text-3xl font-display font-bold text-white/60">{venue.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">{venue.name}</h1>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                <MapPin className="h-4 w-4 shrink-0" />
                {venue.address}
              </a>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white/50">
                <Clock className="h-3.5 w-3.5" />
                Available evenings 5–10pm · Weekends 8am–10pm · School holidays all day
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={venue.book_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-lrso-blue-800 shadow-lg hover:bg-lrso-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Book Online <ExternalLink className="h-4 w-4" />
            </a>
            <button onClick={() => onEnquire(venue.name)}
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all cursor-pointer">
              <Mail className="h-4 w-4" /> Send Enquiry
            </button>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all">
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4 pb-24">
        {/* Info strip */}
        <div className="mb-8 grid sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span><strong>DBS Safeguarded.</strong> Security-cleared supervisors on site.</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-lrso-blue-50 border border-lrso-blue-100 p-4 text-sm text-lrso-blue-800">
            <Clock className="h-5 w-5 text-lrso-blue-600 shrink-0" />
            <span><strong>Flexible Hours.</strong> Evenings, weekends & school holidays.</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
            <Navigation className="h-5 w-5 text-slate-500 shrink-0" />
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              <strong>Get Directions.</strong> {venue.address}
            </a>
          </div>
        </div>

        {/* All facilities header */}
        <h2 className="font-display text-2xl font-extrabold text-slate-900 mb-6">
          Available Facilities <span className="text-slate-400 font-semibold text-lg">({facilities.length})</span>
        </h2>

        {/* All facilities — unified card grid */}
        {facilities.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            {facilities.map((fac) => (
              <a key={fac.id} href={venue.book_link} target="_blank" rel="noopener noreferrer"
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                {/* Image or icon placeholder */}
                <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
                  {fac.image_url ? (
                    <>
                      <img src={fac.image_url} alt={fac.name} loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-lrso-blue-50 to-slate-100 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-2xl bg-lrso-blue-100 group-hover:bg-lrso-blue-200 flex items-center justify-center text-lrso-blue-600 transition-colors">
                        <span className="scale-150">{facilityIcon(fac.name)}</span>
                      </div>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-lrso-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Book →
                  </span>
                </div>
                {/* Text body */}
                <div className="flex flex-col flex-1 p-5">
                  <p className="font-display text-base font-extrabold text-slate-900 group-hover:text-lrso-blue-700 transition-colors mb-2">{fac.name}</p>
                  {fac.description && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{fac.description}</p>
                  )}
                  <div className="mt-auto pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-lrso-blue-600 group-hover:bg-lrso-blue-700 px-4 py-2 text-xs font-bold text-white transition-colors">
                      <ExternalLink className="h-3 w-3" /> Book Now
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Google Maps embed */}
        <div className="mb-12 overflow-hidden rounded-3xl border border-slate-200 shadow-xs">
          <iframe
            title={`Map of ${venue.name}`}
            width="100%"
            height="300"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&output=embed`}
            className="block"
          />
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-lrso-blue-800 to-slate-800 p-8 text-center">
          <h3 className="font-display text-2xl font-extrabold text-white mb-2">Ready to book {venue.name}?</h3>
          <p className="text-sm text-white/60 mb-6">Book instantly online or send us an enquiry.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={venue.book_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-lrso-blue-800 shadow-lg hover:bg-lrso-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Book Now <ExternalLink className="h-4 w-4" />
            </a>
            <button onClick={() => onEnquire(venue.name)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all cursor-pointer">
              <Mail className="h-4 w-4" /> Send Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
