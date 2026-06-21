import React, { useState } from "react";
import { Logo } from "./Logo";
import logoImage from "../assets/lrso_logo.jpg";
import { Phone, Mail, Menu, X, MessageSquare } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Our Venues", id: "venues" },
    { label: "Partnership (Join Us)", id: "partnership" },
    { label: "Contact & Support", id: "contact" },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
      {/* Top micro-bar for direct school assistance */}
      <div className="bg-gradient-to-r from-lrso-blue-800 to-lrso-blue-700 py-2.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            Generating Money for Schools & Community Facilities
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <a
              href="tel:03333355944"
              className="flex items-center gap-1.5 font-mono hover:text-white/90 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-lrso-crimson-500 bg-white/10 p-0.5 rounded-full" />
              0333 3355 944
            </a>
            <a
              href="mailto:enquiries@lrso.co.uk"
              className="flex items-center gap-1.5 hover:text-white/90 transition-colors font-sans"
            >
              <Mail className="h-3.5 w-3.5 opacity-90" />
              enquiries@lrso.co.uk
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo element */}
          <div className="cursor-pointer" onClick={() => handleNavClick("home")}>
            <Logo className="h-14 w-auto" showBookteqPartner={false} showText={false} imageSrc={logoImage} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
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

          {/* Enquiry CTA Button (Right Action) */}
          <div className="hidden items-center gap-3 md:flex">
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
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
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
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                  currentTab === item.id
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
