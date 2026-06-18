import React, { useState } from "react";
import {
  Mail,
  Users,
  Compass,
  FileCheck2,
  Cpu,
  ShieldAlert,
  FolderSync,
  Target,
  KeyRound,
  Coins,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

interface Step {
  stepNum: number;
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  longDesc: string;
  badge: string;
}

export const PartnershipStepper: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);

  const stepsData: Step[] = [
    {
      stepNum: 1,
      icon: <Mail className="h-6 w-6 text-lrso-blue-600" />,
      title: "Contact Us",
      badge: "Inception",
      shortDesc: "Just send an email to enquiries@lrso.co.uk",
      longDesc: "Send a quick note, and our management team will reach out promptly to establish initial project lines.",
    },
    {
      stepNum: 2,
      icon: <Users className="h-6 w-6 text-lrso-blue-600" />,
      title: "Let’s Talk",
      badge: "Consultation",
      shortDesc: "Initial meeting via Microsoft Teams",
      longDesc: "We will introduce our business model, understand your school trust guidelines, and discuss scheduling availability.",
    },
    {
      stepNum: 3,
      icon: <Compass className="h-6 w-6 text-lrso-blue-600" />,
      title: "Site Tour",
      badge: "Inspection",
      shortDesc: "Facility site visit & financial forecasting",
      longDesc: "Our team tours your campus to assess facilities, generate a tailored demographic pricing study, and present a physical Financial Forecast proposal.",
    },
    {
      stepNum: 4,
      icon: <FileCheck2 className="h-6 w-6 text-lrso-blue-600" />,
      title: "Commitment",
      badge: "Agreement",
      shortDesc: "Launch contract with 6-week guarantee",
      longDesc: "Once we partner, we execute a comprehensive legal SLA and guarantee a full operational launch in under six weeks.",
    },
    {
      stepNum: 5,
      icon: <Cpu className="h-6 w-6 text-lrso-blue-600" />,
      title: "Bespoke System Build",
      badge: "Technology",
      shortDesc: "Online booking systems powered by Bookteq",
      longDesc: "We deploy a customized instance of Bookteq specific to your school. Every room, pitch, and court is itemized with pricing mapped to regional demand.",
    },
    {
      stepNum: 6,
      icon: <ShieldAlert className="h-6 w-6 text-lrso-blue-600" />,
      title: "Staff Vetting",
      badge: "Safeguarding",
      shortDesc: "Recruit & train expert Venue Supervisors",
      longDesc: "We hire and train localized staff. All staff undergo stringent Enhanced DBS screening and comprehensive safeguarding training before deployment.",
    },
    {
      stepNum: 7,
      icon: <FolderSync className="h-6 w-6 text-lrso-blue-600" />,
      title: "Customer Onboarding",
      badge: "Migration",
      shortDesc: "Migrate existing school block-bookings",
      longDesc: "We handle the transitions. Your existing block books and regular community users are migrated seamlessly to avoid sports-club disruption.",
    },
    {
      stepNum: 8,
      icon: <Target className="h-6 w-6 text-lrso-blue-600" />,
      title: "Proactive Sales Drive",
      badge: "Marketing",
      shortDesc: "Harnessing our bespoke 'Customer Finder' tool",
      longDesc: "We launch target marketing campaigns and utilize our proprietary CRM tools to pitch local academies, sports leagues, and fitness franchises.",
    },
    {
      stepNum: 9,
      icon: <KeyRound className="h-6 w-6 text-lrso-blue-600" />,
      title: "Site Training",
      badge: "Operations",
      shortDesc: "Full equipment & safety lock-and-alarm runthroughs",
      longDesc: "Our Venue Supervisors complete intensive hands-on drills detailing your emergency systems, site mapping, alarms, and utility controls.",
    },
    {
      stepNum: 10,
      icon: <Coins className="h-6 w-6 text-lrso-crimson-600 bg-lrso-crimson-50 rounded-full" />,
      title: "Official Launch",
      badge: "Revenue",
      shortDesc: "Open doors & deposit monthly revenues",
      longDesc: "Your lettings program opens successfully. You receive regular, detailed financial metrics and premium income lines which are deposited monthly.",
    },
  ];

  const currentStepData = stepsData[activeStep - 1];

  const handlePrev = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleNext = () => {
    if (activeStep < 10) setActiveStep(activeStep + 1);
  };

  return (
    <section className="bg-white py-20" id="partnership-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-lrso-crimson-600 bg-lrso-crimson-50 border border-lrso-crimson-600/10 px-4 py-2 rounded-full">
            Partnership Path
          </span>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            10 Simple Steps to Making More Money
          </h2>
          <p className="mt-5 text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Whether managing bookings in-house, working with an existing letting provider, or starting fresh, our zero-hassle onboarding gets your school earning safely in no time.
          </p>
        </div>

        {/* DESKTOP HIGHLIGHT SELECTOR & PRESENTATION PANEL */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 items-stretch pt-2" id="desktop-stepper">
          
          {/* Left: Interactive Progress List */}
          <div className="col-span-4 space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {stepsData.map((step) => {
              const isActive = activeStep === step.stepNum;
              const isPast = activeStep > step.stepNum;
              return (
                <button
                  key={step.stepNum}
                  onClick={() => setActiveStep(step.stepNum)}
                  className={`flex w-full items-center text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 border-slate-900 shadow-md transform translate-x-1"
                      : isPast
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold mr-3.5 ${
                       isActive
                        ? "bg-lrso-crimson-600 text-white"
                        : isPast
                        ? "bg-lrso-blue-100 text-lrso-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {step.stepNum}
                  </span>
                  <div>
                    <span
                      className={`block font-bold text-base tracking-tight leading-tight ${
                        isActive ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className={`text-xs mt-0.5 block ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                      {step.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Guide Preview Card */}
          <div className="col-span-8 bg-slate-50 rounded-3xl p-10 border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              {/* Card Meta Tag */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-lrso-crimson-600 bg-lrso-crimson-50 border border-lrso-crimson-600/15 px-3.5 py-1 rounded-full">
                  Step {currentStepData.stepNum} &bull; {currentStepData.badge}
                </span>
                <span className="font-mono text-sm font-bold text-slate-400">
                  {currentStepData.stepNum}/10
                </span>
              </div>

              {/* Big Icon Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-100">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="font-display text-3xl font-extrabold text-slate-900 leading-tight">
                    {currentStepData.title}
                  </h3>
                  <p className="text-base font-bold text-lrso-blue-600 mt-1.5">
                    {currentStepData.shortDesc}
                  </p>
                </div>
              </div>

              {/* Full copy */}
              <p className="text-base text-slate-600 leading-relaxed font-semibold">
                {currentStepData.longDesc}
              </p>
            </div>

            {/* Stepper Navigation buttons and CTA */}
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={activeStep === 1}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeStep === 10}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {currentStepData.stepNum === 10 ? (
                <a
                  href="mailto:enquiries@lrso.co.uk?subject=Let's Partner with LRSO"
                  className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  Schedule Microsoft Teams Talk
                </a>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 text-sm font-bold text-lrso-blue-600 hover:text-lrso-crimson-500 transition-colors cursor-pointer"
                >
                  Proceed to Step {currentStepData.stepNum + 1} &rarr;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE RESPONSIVE ACCORDION VIEW */}
        <div className="lg:hidden space-y-4" id="mobile-stepper">
          {stepsData.map((step) => {
            const isAccordionOpen = openAccordion === step.stepNum;
            return (
              <div
                key={step.stepNum}
                className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenAccordion(isAccordionOpen ? null : step.stepNum)}
                  className="flex w-full items-center justify-between p-4 text-left select-none bg-white font-sans"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lrso-blue-50 text-xs font-bold text-lrso-blue-700">
                      {step.stepNum}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{step.title}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isAccordionOpen ? "rotate-180 text-slate-800" : ""
                    }`}
                  />
                </button>

                {isAccordionOpen && (
                  <div className="p-4 border-t border-slate-100 text-xs text-slate-600">
                    <span className="inline-block text-[9px] font-bold text-lrso-crimson-600 mb-1 uppercase tracking-wide">
                      {step.badge}
                    </span>
                    <p className="font-bold text-slate-800 mb-2">{step.shortDesc}</p>
                    <p className="leading-relaxed mb-4">{step.longDesc}</p>
                    
                    {step.stepNum === 1 && (
                      <a
                        href="mailto:enquiries@lrso.co.uk"
                        className="inline-block rounded-lg bg-slate-900 text-white px-4 py-2 font-bold text-[10px] uppercase"
                      >
                        Send Onboarding Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
