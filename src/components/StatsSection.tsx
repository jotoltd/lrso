import React, { useState, useEffect, useRef } from "react";
import { Coins, ShieldAlert, Award, CalendarCheck, Users, Zap } from "lucide-react";

export const StatsSection: React.FC = () => {
  const highlights = [
    {
      icon: <Coins className="h-6 w-6 text-emerald-600" />,
      title: "Guaranteed Revenue",
      description: "We handle sales, marketing, and scheduling to optimize booking slots, ensuring robust passive income lines for educational trusts.",
      badge: "Financial Growth",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-lrso-crimson-600" />,
      title: "100% Vetted Safeguarding",
      description: "All Venue Supervisors are fully security vetted, receive certified Enhanced DBS checks, and undergo extensive child safety protocols.",
      badge: "Insured Security",
      badgeColor: "bg-red-50 text-red-700 border-red-100",
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      title: "Hassle-Free Implementation",
      description: "From onboarding existing customers to site-wide health & safety compliance, we commit to fully active lettings under 6 weeks.",
      badge: "Rapid Launch",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      icon: <CalendarCheck className="h-6 w-6 text-lrso-blue-600" />,
      title: "Modern Booking Tech",
      description: "Powered by Bookteq, we build customizable scheduling platforms tailored to geographical metrics and demographic pricing models.",
      badge: "Bookteq Partner",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    },
  ];

  const statCounters = [
    { target: 3.2, format: (v: number) => `£${v.toFixed(1)}M+`, label: "Generated for Partner Schools" },
    { target: 100, format: (v: number) => `${Math.round(v)}%`, label: "Fully Managed & Professionally Staffed" },
    { target: 12, format: (v: number) => `${Math.round(v)}+`, label: "Elite Academies & Schools Managed" },
    { target: 10000, format: (v: number) => `${Math.round(v).toLocaleString()}+`, label: "Weekly Sport & Community Attendees" },
  ];

  const [values, setValues] = useState<number[]>(() => statCounters.map(() => 0));
  const gridRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const duration = 2000;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValues(statCounters.map(s => s.target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-slate-50 py-20 border-y border-slate-200" id="stats-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Trust Figures */}
        <div id="trust-counter-grid" ref={gridRef} className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4">
          {statCounters.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <span className="font-display text-4xl font-bold text-lrso-blue-700 lg:text-5xl">
                {stat.format(values[i])}
              </span>
              <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Why Partner with LRSO?
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed font-medium">
            We bridge the gap between schools with valuable community space, and the general public longing for professional places to train, worship, and play.
          </p>
        </div>

        {/* Highlight Cards Grid */}
        <div id="guarantees-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between rounded-3xl bg-white p-8 border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="rounded-2xl bg-slate-50 p-3.5 ring-4 ring-slate-100 group-hover:bg-white group-hover:ring-slate-50/10 transition-all">
                    {item.icon}
                  </div>
                  <span className={`text-xs uppercase font-bold tracking-wider border px-3 py-1.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-lrso-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3.5 text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-lrso-blue-600 group-hover:text-lrso-crimson-600 flex items-center gap-1 transition-colors cursor-pointer">
                  Learn more &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
