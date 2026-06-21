import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Mail,
  Loader2,
  CheckCircle2,
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
}

export const VenuePage: React.FC<VenuePageProps> = ({ venueId, onBack }) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetch = async () => {
      setLoading(true);
      const [{ data: v }, { data: f }] = await Promise.all([
        supabase.from("venues").select("*").eq("id", venueId).single(),
        supabase
          .from("facilities")
          .select("*")
          .eq("venue_id", venueId)
          .order("sort_order", { ascending: true }),
      ]);
      if (v) setVenue(v as Venue);
      if (f) setFacilities(f as Facility[]);
      setLoading(false);
    };
    fetch();
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
        <button onClick={onBack} className="text-lrso-blue-600 font-bold underline cursor-pointer">
          Back to venues
        </button>
      </div>
    );
  }

  const facilitiesWithImages = facilities.filter((f) => f.image_url);
  const facilitiesWithoutImages = facilities.filter((f) => !f.image_url);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-lrso-blue-900 via-lrso-blue-800 to-slate-800 px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            All Venues
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {venue.logo_url ? (
              <img
                src={venue.logo_url}
                alt={`${venue.name} logo`}
                className="h-36 w-28 rounded-2xl object-contain bg-white/10 border border-white/20 p-2 shrink-0"
              />
            ) : (
              <div className="h-36 w-28 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <span className="text-3xl font-display font-bold text-white/60">
                  {venue.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {venue.name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                {venue.address}
              </p>
            </div>
          </div>

          {/* CTA strip */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={venue.book_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-lrso-blue-800 shadow-lg hover:bg-lrso-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Book Online
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={`mailto:enquiries@lrso.co.uk?subject=Enquiry about ${venue.name}`}
              className="flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              <Mail className="h-4 w-4" />
              Email Enquiry
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-6 pb-24">
        {/* Safeguarding badge */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800 shadow-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>
            <strong>DBS Safeguarding Guaranteed.</strong> Fully managed by
            security-cleared LRSO Supervisors. Available evenings, weekends &
            school holidays.
          </span>
        </div>

        {/* Facilities with images — large cards */}
        {facilitiesWithImages.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mb-6">
              Facilities
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {facilitiesWithImages.map((fac) => (
                <a
                  key={fac.id}
                  href={venue.book_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={fac.image_url!}
                      alt={fac.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 left-4 font-display text-lg font-bold text-white drop-shadow">
                      {fac.name}
                    </span>
                  </div>
                  {fac.description && (
                    <div className="p-4">
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {fac.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-lrso-blue-600 group-hover:text-lrso-blue-800 transition-colors">
                        Book this space
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Facilities without images — compact list */}
        {facilitiesWithoutImages.length > 0 && (
          <section className="mb-12">
            {facilitiesWithImages.length > 0 && (
              <h2 className="font-display text-xl font-extrabold text-slate-900 mb-4">
                More Spaces
              </h2>
            )}
            {facilitiesWithImages.length === 0 && (
              <h2 className="font-display text-2xl font-extrabold text-slate-900 mb-6">
                Facilities
              </h2>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {facilitiesWithoutImages.map((fac) => (
                <a
                  key={fac.id}
                  href={venue.book_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-lrso-blue-50 hover:border-lrso-blue-200 p-4 transition-all"
                >
                  <div className="mt-0.5 h-8 w-8 rounded-xl bg-lrso-blue-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-lrso-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{fac.name}</p>
                    {fac.description && (
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {fac.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Book CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-lrso-blue-800 to-slate-800 p-8 text-center">
          <h3 className="font-display text-2xl font-extrabold text-white mb-2">
            Ready to book {venue.name}?
          </h3>
          <p className="text-sm text-white/60 mb-6">
            Book instantly online via our secure booking platform.
          </p>
          <a
            href={venue.book_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-lrso-blue-800 shadow-lg hover:bg-lrso-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Book Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

    </div>
  );
};
