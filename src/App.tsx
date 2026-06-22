import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  Outlet,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { VenueExplorer } from "./components/VenueExplorer";
import { PartnershipStepper } from "./components/PartnershipStepper";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { ScrollProgress } from "./components/ScrollProgress";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { BackToTop } from "./components/BackToTop";
import { AdminPanel } from "./components/AdminPanel";
import { VenuePage } from "./components/VenuePage";
import { School } from "lucide-react";

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

function usePageAnimations() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return location;
}

function MainLayout() {
  const location = usePageAnimations();
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-lrso-crimson-600 selection:text-white flex flex-col justify-between transition-colors duration-300">
      <ScrollProgress />
      <Navbar />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BackToTop />
      <MobileBottomNav />
    </div>
  );
}

function HomePage() {
  const [cyclingWordIdx, setCyclingWordIdx] = useState(0);
  const [activeStockIdx, setActiveStockIdx] = useState(0);
  const navigate = useNavigate();

  const verbs = ["Play", "Train", "Dance", "Sing", "Worship", "Socialise", "Learn", "Celebrate", "Act", "Paint", "Cook"];

  useEffect(() => {
    const interval = setInterval(() => setCyclingWordIdx((prev) => (prev + 1) % verbs.length), 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStockIdx((prev) => (prev + 1) % heroStocks.length), 3800);
    return () => clearInterval(timer);
  }, []);

  const handleEnquire = (subject: string) => {
    navigate(`/contact?subject=${encodeURIComponent(subject)}`);
  };

  return (
    <Home
      handleEnquire={handleEnquire}
      cyclingWordIdx={cyclingWordIdx}
      verbs={verbs}
      activeStockIdx={activeStockIdx}
      setActiveStockIdx={setActiveStockIdx}
      heroStocks={heroStocks}
    />
  );
}

function VenuesPage() {
  const navigate = useNavigate();
  return (
    <VenueExplorer
      onVenueSelect={(id) => navigate(`/venues/${id}`)}
    />
  );
}

function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;
  return (
    <VenuePage
      venueId={id}
      onBack={() => navigate("/venues")}
      onEnquire={(subject) => navigate(`/contact?subject=${encodeURIComponent(subject)}`)}
    />
  );
}

function ContactPage() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";
  return <ContactSection initialSubject={initialSubject} />;
}

function PartnershipPage() {
  return (
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
  );
}

function AdminShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminShortcut />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenueDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/partnership" element={<PartnershipPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
