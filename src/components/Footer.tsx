import React from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Phone, Mail, MapPin } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { value } = useSiteContent();
  const regions = ["Nottingham", "Ipswich", "Croydon & London", "Swindon", "Derby"];

  const handleTabClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800" id="footer-container">
      
      {/* Upper footer content container */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* Col 1: Brand details and bookteq partner disclosure */}
          <div className="space-y-6">
            <div className="cursor-pointer" onClick={() => handleTabClick("/")}>
              <Logo className="h-12 w-12" darkText={false} showText={true} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold whitespace-pre-line">
              {value("footer.mission", "Connecting the people who want to Do with the schools and clubs that have the facilities to let. Maintenance of healthy mind & bodies through local sport activity.")}
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/lrso"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="LRSO Twitter"
              >
                <span className="text-xs font-mono font-bold">@lrso</span>
              </a>
              <span className="text-xs text-slate-500 font-mono self-center">Twitter & Facebook channels</span>
            </div>
          </div>

          {/* Col 2: Site Quick Navigation */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-300 border-l-2 border-lrso-crimson-600 pl-3">
              Explore Services
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => handleTabClick("/")} className="hover:text-white transition-colors">
                  Home Landing & Mission
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick("/venues")} className="hover:text-white transition-colors">
                  Our Hire Venues
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick("/contact")} className="hover:text-white transition-colors">
                  Send Enquiry
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick("/partnership")} className="hover:text-white transition-colors">
                  Join Us (School Trusts)
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick("/contact")} className="hover:text-white transition-colors">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Partner Regions */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-300 border-l-2 border-lrso-blue-600 pl-3">
              Hire Regions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              {regions.map((reg) => (
                <li key={reg}>
                  <button
                    onClick={() => handleTabClick("/venues")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Sport halls in {reg}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Corporate Registration & Help Direct lines */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-300 border-l-2 border-lrso-crimson-600 pl-3">
              HQ Helplines
            </h4>
            <div className="space-y-3.5 text-xs text-slate-400 font-semibold">
              <a href={`tel:${value("footer.phone", "03333355944")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 shrink-0 text-lrso-crimson-600" />
                <span>{value("footer.phone", "0333 3355 944")}</span>
              </a>
              <a href={`mailto:${value("footer.email", "enquiries@lrso.co.uk")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-lrso-blue-600" />
                <span>{value("footer.email", "enquiries@lrso.co.uk")}</span>
              </a>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                <span className="leading-relaxed text-[11px] text-slate-400 whitespace-pre-line">
                  {value("footer.address", "Unit 8, Amberley Court,\nWhitworth Road, Crawley,\nWest Sussex, RH11 7XL")}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Partnership logo stamp and copyright block */}
      <div className="bg-slate-950 text-slate-500 py-8 border-t border-slate-800/40 text-[11px] font-semibold">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} {value("footer.company_name", "LRSO Ltd")}. All rights reserved.</p>
            <p className="text-slate-600">{value("footer.tagline", "Generating Money for Schools, Sports Clubs and Community Facilities. Registered office: Unit 8 Amberley Court, Crawley.")}</p>
          </div>

          {/* Bookteq Partnership Badge */}
          <div className="flex items-center gap-3.5 bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-800 shrink-0">
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Lettings System Powered by</span>
              <span className="font-display text-xs font-bold text-slate-400 tracking-tight">bookteq partner</span>
            </div>
            {/* Red Teardrop symbol */}
            <svg viewBox="0 0 100 100" className="h-4 w-4 fill-lrso-crimson-600 animate-pulse">
              <path d="M 50 10 C 70 30, 85 45, 85 60 C 85 75, 70 90, 50 90 C 30 90, 15 75, 15 60 C 15 45, 30 30, 50 10 Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-[10px] text-slate-600 font-semibold">
            &copy; {new Date().getFullYear()} LRSO Ltd. All rights reserved.
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="text-[10px] text-slate-700 hover:text-slate-500 font-semibold transition-colors cursor-pointer"
            title="Admin Login"
          >
            Admin
          </button>
        </div>
      </div>

    </footer>
  );
};
