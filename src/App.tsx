import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { VenueExplorer } from "./components/VenueExplorer";
import { PartnershipStepper } from "./components/PartnershipStepper";
import { BookingForm } from "./components/BookingForm";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { ScrollProgress } from "./components/ScrollProgress";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { BackToTop } from "./components/BackToTop";
import { AdminPanel } from "./components/AdminPanel";
import { VenuePage } from "./components/VenuePage";
import { School } from "lucide-react";

// Import Home component representing classic split layout
import { Home } from "./components/Home";

const heroStocks = [
  {
    category: "MAIN HALL",
    title: "Large Multi-Purpose School Assemblies & Events",
    desc: "Spacious assembly halls featuring theatrical stages, sound systems, and multi-row seating configurations ideal for worship, community events, and exams.",
    img: "https://images.unsplash.com/photo-1516629081224-6b95a55535cd?auto=format&fit=crop&q=80&w=1000",
    badge: "Celebrate & Gather",
  },
  {
    category: "SPORTS HALL",
    title: "Double-Height Multi-Sport Olympic Arenas",
    desc: "Professional indoor surfaces marked for basketball, netball, badminton, and futsal, complete with rebound boards and sporting gear.",
    img: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=1000",
    badge: "Compete & Succeed",
  },
  {
    category: "7-A-SIDE",
    title: "Premium 7-a-Side Floodlit 3G Pitches",
    desc: "Elite all-weather artificial turf matches under state-of-the-art stadium lighting. Optimal for league play and group training.",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000",
    badge: "Play & Dominate",
  },
  {
    category: "5-A-SIDE",
    title: "Fast-Paced 5-a-Side Mini-Pitches",
    desc: "Fenced high-tempo synthetic grass cages. Perfect for casual evening kickabouts, friendly tournaments, and tactical drills.",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000",
    badge: "High-Energy Action",
  },
  {
    category: "DANCE",
    title: "Sprung-Floor Mirrored Dance Studios",
    desc: "Equipped with professional sound systems, full-length mirrors, ballet barres, and temperature control for choreography and fitness.",
    img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1000",
    badge: "Create & Express",
  },
  {
    category: "DRAMA",
    title: "Acoustic Black-Box Drama Studios & Stages",
    desc: "Intimate rehearsal spaces with professional mood lighting controls, rich acoustics, and modular staging setups.",
    img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=1000",
    badge: "Rehearse & Perform",
  },
  {
    category: "RUGBY",
    title: "Expansive Grass Rugby & Athletics Outfields",
    desc: "Impeccably maintained grass pitches with regulation rugby goal posts and open fields, ready for tough matches and bootcamp training.",
    img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1000",
    badge: "Power & Teamwork",
  },
  {
    category: "SPACE HIRE",
    title: "Classrooms, Meeting Rooms & Sensory Hubs",
    desc: "Functional meeting spaces, modern learning facilities, and specialized therapy rooms fitted with interactive whiteboards and rapid Wi-Fi.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
    badge: "Learn & Collaborate",
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [activeVenueId, setActiveVenueId] = useState<string | null>(null);
  const [preselectedVenue, setPreselectedVenue] = useState<string>("");
  const [cyclingWordIdx, setCyclingWordIdx] = useState(0);
  const [activeStockIdx, setActiveStockIdx] = useState(0);

  const verbs = [
    "Play",
    "Train",
    "Dance",
    "Sing",
    "Worship",
    "Socialise",
    "Learn",
    "Celebrate",
    "Act",
    "Paint",
    "Cook",
  ];

  // Cycle high-energy verbs in hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCyclingWordIdx((prev) => (prev + 1) % verbs.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Cycle premium hero stock showcase photos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStockIdx((prev) => (prev + 1) % heroStocks.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleBookVenue = (venueName: string) => {
    setPreselectedVenue(venueName);
    setActiveVenueId(null);
    setCurrentTab("booking");
  };

  // Reset venue page when switching tabs
  useEffect(() => {
    setActiveVenueId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab]);

  // Secret keyboard shortcut to open admin: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setCurrentTab("admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentThemeBgColor = "bg-white";

  const tabContent = {
    home: (
      <Home
        setCurrentTab={setCurrentTab}
        handleBookVenue={handleBookVenue}
        cyclingWordIdx={cyclingWordIdx}
        verbs={verbs}
        activeStockIdx={activeStockIdx}
        setActiveStockIdx={setActiveStockIdx}
        heroStocks={heroStocks}
      />
    ),
    venues: activeVenueId
      ? <VenuePage venueId={activeVenueId} onBack={() => setActiveVenueId(null)} onEnquire={handleBookVenue} />
      : <VenueExplorer onBookClick={handleBookVenue} onVenueSelect={(id) => setActiveVenueId(id)} />,
    booking: <BookingForm initialVenueName={preselectedVenue} onSuccessSubmit={() => setPreselectedVenue("")} />,
    partnership: (
      <>
        <section className="bg-gradient-to-b from-slate-50 via-white to-white py-20 border-b border-slate-100">
          <div className="mx-auto max-w-4xl text-center px-4 space-y-6">
            <School className="mx-auto h-16 w-16 text-lrso-blue-700 bg-lrso-blue-50 p-3.5 rounded-2xl border border-lrso-blue-100 shadow-xs" />
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              In Partnership with Educational Sites & Sports Clubs
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed font-semibold max-w-2xl mx-auto">
              LRSO generate significant and much-needed revenue for schools and sports clubs through the sales and management of their facilities for community use.
            </p>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              We handle absolutely all aspects of the lettings process, from customer service, sales & marketing, bookings and finance through to the safe and professional supervision of all lettings by our highly trained Venue Supervisors.
            </p>
          </div>
        </section>
        <PartnershipStepper />
      </>
    ),
    contact: <ContactSection />,
  };

  if (currentTab === "admin") {
    return <AdminPanel />;
  }

  return (
    <div className={`min-h-screen ${currentThemeBgColor} text-slate-800 font-sans selection:bg-lrso-crimson-600 selection:text-white flex flex-col justify-between transition-colors duration-300`}>
      <ScrollProgress />
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {tabContent[currentTab as keyof typeof tabContent]}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <BackToTop />
      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}
