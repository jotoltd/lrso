import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import logoImage from "../assets/lrso_logo.jpg";
import { Phone, Mail, Menu, X, MessageSquare } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Our Venues", path: "/venues" },
    { label: "Partnership (Join Us)", path: "/partnership" },
    { label: "Contact & Support", path: "/contact" },
  ];

  const currentPath = location.pathname;

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md transition-all duration-300 ${isScrolled ? "h-24" : "h-48"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center">
          {/* Desktop Navigation */}
          <nav className="hidden flex-1 items-center gap-1.5 md:flex">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  id={`nav-btn-${item.path.replace(/\//g, "-") || "home"}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 rounded-xl cursor-pointer ${
                    isActive
                      ? "bg-lrso-blue-50 text-lrso-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-gradient-to-r from-lrso-blue-600 to-lrso-crimson-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logo element */}
          <div className="flex flex-1 items-center justify-center md:flex-initial">
            <div className="cursor-pointer" onClick={() => handleNavClick("/")}>
              <Logo 
                className={`w-auto transition-all duration-300 ${isScrolled ? "h-20" : "h-40"}`} 
                showBookteqPartner={false} 
                showText={false} 
                imageSrc={logoImage} 
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Phone & Email */}
            <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-600">
              <a
                href="tel:03333355944"
                className="flex flex-col items-center hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-lrso-crimson-600" />
                  0333 3355 944
                </span>
                <span className="h-0.5 w-full bg-gradient-to-r from-lrso-blue-600 to-lrso-crimson-600 rounded-full" />
              </a>
              <a
                href="mailto:enquiries@lrso.co.uk"
                className="flex flex-col items-center hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-lrso-blue-600" />
                  enquiries@lrso.co.uk
                </span>
                <span className="h-0.5 w-full bg-gradient-to-r from-lrso-crimson-600 to-lrso-blue-600 rounded-full" />
              </a>
            </div>

            {/* Enquiry CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNavClick("contact")}
                id="header-enquiry-cta"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-lrso-crimson-600 to-lrso-crimson-700 px-6 py-3 text-[15px] font-bold text-white shadow-md shadow-lrso-crimson-600/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-lrso-crimson-600/20 active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                Send Enquiry
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pt-2 pb-6 shadow-xl md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                id={`mobile-nav-${item.path.replace(/\//g, "-") || "home"}`}
                onClick={() => handleNavClick(item.path)}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                  currentPath === item.path
                    ? "bg-lrso-blue-50 text-lrso-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <a
              href="tel:03333355944"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Phone className="h-5 w-5 text-lrso-blue-600" />
              0333 3355 944
            </a>
            <a
              href="mailto:enquiries@lrso.co.uk"
              className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-5 w-5 text-lrso-crimson-600" />
              enquiries@lrso.co.uk
            </a>
            <button
              onClick={() => handleNavClick("contact")}
              id="mobile-menu-enquiry-cta"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lrso-crimson-600 to-lrso-crimson-700 py-3 text-center text-sm font-bold text-white shadow-md cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-white" />
              Send Enquiry
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
