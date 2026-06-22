import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Heart, MapPin, Search, CalendarDays, Trophy, ShieldCheck, Star, Users } from "lucide-react";
import { Logo } from "./Logo";
import logoImage from "../assets/lrso_logo.jpg";
import heroImg1 from "../assets/pexels-break-media-186685971-37989204.jpg";
import heroImg2 from "../assets/pexels-edwardeyer-10611956.jpg";
import heroImg3 from "../assets/pexels-jeffrey-paa-kwesi-opare-157343-36862523.jpg";
import heroImg4 from "../assets/pexels-risingstudio07-34563722.jpg";
import { StatsSection } from "./StatsSection";
import { motion } from "motion/react";
import { FadeIn } from "./FadeIn";
import { useSiteContent } from "../context/SiteContentContext";

interface HomepageProps {
  handleEnquire: (subject: string) => void;
}

const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4];

const SectionDivider = () => (
  <div className="h-1 w-full bg-gradient-to-r from-lrso-blue-600 to-lrso-crimson-600" aria-hidden="true" />
);

const defaultHeroStocks = [
  { category: "MAIN HALL", badge: "Celebrate & Gather", img: heroImages[0] },
  { category: "SPORTS HALL", badge: "Compete & Succeed", img: heroImages[1] },
  { category: "7-A-SIDE", badge: "Play & Dominate", img: heroImages[2] },
  { category: "5-A-SIDE", badge: "High-Energy Action", img: heroImages[3] },
  { category: "DANCE", badge: "Create & Express", img: heroImages[0] },
  { category: "DRAMA", badge: "Rehearse & Perform", img: heroImages[1] },
  { category: "RUGBY", badge: "Power & Teamwork", img: heroImages[2] },
  { category: "SPACE HIRE", badge: "Learn & Collaborate", img: heroImages[3] },
];

export const Home: React.FC<HomepageProps> = ({ handleEnquire }) => {
  const navigate = useNavigate();
  const { value, image } = useSiteContent();
  const [cyclingWordIdx, setCyclingWordIdx] = useState(0);
  const [activeStockIdx, setActiveStockIdx] = useState(0);

  const verbs = ["Play", "Train", "Dance", "Sing", "Worship", "Socialise", "Learn", "Celebrate", "Act", "Paint", "Cook"];
  const heroStocks = defaultHeroStocks.map((stock, idx) => ({
    ...stock,
    title: value(`home.hero.stock_${idx + 1}.title`, stock.category),
    desc: value(`home.hero.stock_${idx + 1}.desc`, ""),
    img: image(`home.hero.stock_${idx + 1}.image`) || stock.img,
  }));

  useEffect(() => {
    const interval = setInterval(() => setCyclingWordIdx((prev) => (prev + 1) % verbs.length), 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStockIdx((prev) => (prev + 1) % heroStocks.length), 7000);
    return () => clearInterval(timer);
  }, [heroStocks.length]);
  return (
    <div className="animate-in fade-in duration-500">
      {/* MASSIVE ULTRA-PREMIUM FULL-WIDTH HERO SLIDER SECTION */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 lg:py-36 min-h-[85vh] flex items-center" id="hero-banner">
        
        {/* Dynamic Full-Width Background Slider */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {heroStocks.map((stock, idx) => {
            const isCurrent = idx === activeStockIdx;
            return (
              <div
                key={stock.category}
                className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                  isCurrent ? "opacity-100" : "opacity-0"
                }`}
              >
                <img 
                  src={stock.img} 
                  alt={stock.title} 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center scale-[1.02] transition-transform duration-[7000ms] ease-out"
                />
              </div>
            );
          })}
          {/* Cinematic Overlay Gradients to guarantee high readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center pt-8 sm:pt-12">
            <div className="flex flex-col text-left items-start space-y-8">
            
            {/* Majestic Display Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] max-w-4xl">
              {value("home.hero.title", "Hire Premium School Facilities in Your Area")}
            </h1>

            {/* Consolidative, Elegant Slogan Subtitle */}
            <div className="space-y-3.5 max-w-2xl text-left border-l-2 border-[#bf3a3f] pl-4 sm:pl-6 my-2">
              <p className="text-lg sm:text-xl font-medium text-slate-200 leading-relaxed font-display">
                {value("home.hero.subtitle", "Maximising educational assets to support community wellness and local growth.")}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {value("home.hero.description", "We bridge regional demand with vacant educational facilities. LRSO handles all marketing, operations, booking, billing, and DBS-vetted Venue Supervision for our trusted partners.")}
              </p>
            </div>

            {/* Call-To-Action Options */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => navigate("/venues")}
                id="hero-view-venues-btn"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-100 px-10 py-5 text-base font-bold uppercase tracking-wider text-slate-950 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {value("home.hero.cta_primary", "Browse Hire Venues")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/partnership")}
                id="hero-join-us-btn"
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-slate-950/30 hover:bg-slate-950/50 backdrop-blur-md px-10 py-5 text-base font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {value("home.hero.cta_secondary", "Onboard My School")}
              </button>
            </div>

            {/* Trust Badge Integration Details */}
            <div className="pt-4 flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold text-slate-400">Integrated System Partner</span>
              <div className="h-8 flex items-center gap-1.5">
                <svg viewBox="0 0 100 100" className="h-4 w-4 fill-[#bf3a3f]">
                  <path d="M 50 10 C 70 30, 85 45, 85 60 C 85 75, 70 90, 50 90 C 30 90, 15 75, 15 60 C 15 45, 30 30, 50 10 Z" />
                </svg>
                <span className="font-sans text-xs font-bold text-white">bookteq</span>
              </div>
            </div>

          </div>

          {/* Venue CTA Panel */}
          <div className="hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-lrso-crimson-600/20 to-lrso-blue-600/20" />
              <div className="relative p-8 flex flex-col gap-5">
                  <h3 className="font-display text-2xl font-bold text-white">Premium School Venues Available Now</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Browse our full catalogue of DBS-supervised educational facilities — sports halls, 3G pitches, dance studios, and more.</p>
                <p className="text-sm text-slate-300 leading-relaxed">Available evenings, weekends &amp; school holidays.</p>
                <button
                  onClick={() => navigate("/venues")}
                  className="flex items-center gap-2 text-sm font-bold text-white hover:text-lrso-crimson-400 transition-colors cursor-pointer"
                >
                  View All Venues <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      <SectionDivider />

      <FadeIn>
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            <div className="flex items-center gap-2.5 text-slate-500">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold">DBS Safeguarding</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold">bookteq Partner</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Users className="h-5 w-5 text-lrso-blue-600" />
              <span className="text-sm font-bold">50+ Community Groups</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Trophy className="h-5 w-5 text-lrso-crimson-600" />
              <span className="text-sm font-bold">£500K+ Generated</span>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
      <section className="bg-slate-50 py-24" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-lrso-blue-600">Simple Process</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              How It Works
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: <Search className="h-8 w-8" />, step: "01", title: "Browse", desc: "Search and filter venues by location, facilities, and availability. View detailed facility information and photos." },
              { icon: <CalendarDays className="h-8 w-8" />, step: "02", title: "Enquire or Book", desc: "Send us an enquiry, or book directly on the venue's Bookteq page. We'll confirm availability and access details." },
              { icon: <Trophy className="h-8 w-8" />, step: "03", title: "Play", desc: "Arrive to a fully supervised, unlocked facility. Our DBS-vetted Venue Supervisors ensure everything runs smoothly." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <span className="absolute top-6 right-6 font-display text-5xl font-black text-slate-100">{item.step}</span>
                <div className="h-14 w-14 rounded-2xl bg-lrso-blue-50 text-lrso-blue-600 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="welcome-details">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lrso-blue-100/40 blur-3xl" />
            
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl flex flex-col items-center">
              <Logo className="h-44 w-auto" showText={false} imageSrc={logoImage} />
              <div className="text-center mt-6">
                <h3 className="font-display font-bold text-xl text-slate-950">Generating Money for Schools</h3>
                <p className="text-xs text-slate-500 mt-2">Connecting regional community demand directly with empty educational supply.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Utilising Schools to Enrich Lives and Earning Potential
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Active participation in sports, wellness, and local events is one of the most important factors in maintaining a healthy mind and body. Whether that&rsquo;s kicking a ball around with friends, rehearsing a play, or joining a local community assembly.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              Our emphasis is on making premium facilities available so that those life-enriching activities can take place. Schools are the natural solution to the nation&rsquo;s shortage of facilities for community use, and <strong className="text-slate-800">LRSO are the right company</strong> to meet the demand with supply.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 pt-4">
              <div className="flex gap-3.5">
                <div className="h-7 w-7 rounded-full bg-lrso-blue-100 text-lrso-blue-700 shrink-0 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Revenue for Schools</h4>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">We optimize lettings to generate significant, much-needed revenue for sports academies & trusts.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="h-7 w-7 rounded-full bg-lrso-blue-100 text-lrso-blue-700 shrink-0 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Fully Safeguarded</h4>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">All booking blocks are supervised by professional, security-vetted Venue Supervisors in a secure habitat.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Star className="mx-auto h-8 w-8 text-amber-400 mb-6" />
          <blockquote className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-snug mb-6">
            &ldquo;LRSO generated over &pound;12,000 in extra income for our school in the first term alone. The process was seamless and our facilities are now fully utilised.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-lrso-blue-100 flex items-center justify-center text-lrso-blue-700 font-bold text-sm">JD</div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">James Davidson</p>
              <p className="text-xs text-slate-500">Headteacher, Coombe Wood School</p>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
      <section className="bg-slate-900 py-24 text-white" id="schools-cta">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-5 max-w-3xl text-left">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Want to Generate Extra Income for Your School?
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              We handle customer service, marketing, automated billing, and trained supervisor staffing. Your only job is deciding how to reinvest the additional funds we secure for you.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => navigate("/partnership")}
              id="welcome-partnership-btn"
              className="w-full md:w-auto text-center rounded-2xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-base font-bold text-white px-8 py-4 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              View Our 10-Step Onboarding
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
        <StatsSection />
      </FadeIn>

      <SectionDivider />

      <FadeIn delay={0.1}>
      <section className="bg-gradient-to-br from-lrso-blue-800 to-lrso-blue-700 py-24 text-white relative overflow-hidden" id="homescreen-support">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center space-y-8">
          <Heart className="mx-auto h-14 w-14 text-lrso-crimson-600 animate-pulse bg-white/95 p-3.5 rounded-2xl shadow-md" />
          <h3 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">{value("home.support.title", "Ready to Secure Your Space?")}</h3>
          <p className="text-base text-slate-200 max-w-xl mx-auto leading-relaxed font-medium">
            {value("home.support.body", "We look forward to arranging booking calendars or answering trust guidelines on Microsoft Teams. Feel free to contact Crawley staff directly!")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => handleEnquire("General venue enquiry")}
              id="support-cta-enquire-btn"
              className="rounded-2xl bg-lrso-crimson-600 hover:bg-lrso-crimson-700 text-sm font-bold text-white px-8 py-4 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {value("home.support.cta_primary", "Send an Enquiry")}
            </button>
            <button
              onClick={() => navigate("/contact")}
              id="support-cta-contact-btn"
              className="rounded-2xl bg-white/10 hover:bg-white/20 text-sm font-bold text-white px-8 py-4 border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {value("home.support.cta_secondary", "Contact Support HQ")}
            </button>
          </div>
        </div>
      </section>
      </FadeIn>

    </div>
  );
};
