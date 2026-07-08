import { useEffect } from "react";
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
import { SiteContentProvider, useSiteContent } from "./context/SiteContentContext";

import { Home } from "./components/Home";

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
  const navigate = useNavigate();
  const handleEnquire = (subject: string) => {
    navigate(`/contact?subject=${encodeURIComponent(subject)}`);
  };
  return <Home handleEnquire={handleEnquire} />;
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
    />
  );
}

function ContactPage() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";
  return <ContactSection initialSubject={initialSubject} />;
}

function PartnershipPage() {
  const { value } = useSiteContent();
  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 via-white to-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-4xl text-center px-4 space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {value("partnership.header.title", "In Partnership with Schools and Sports Clubs")}
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed font-semibold max-w-2xl mx-auto">
            {value("partnership.header.lead", "LRSO generate significant and much-needed revenue for schools and sports clubs through the sales and management of their facilities for community use.")}
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            {value("partnership.header.body", "We handle absolutely all aspects of the lettings process, from customer service, sales & marketing, bookings and finance through to the safe and professional supervision of all lettings by our highly trained Venue Supervisors.")}
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
    <SiteContentProvider>
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
    </SiteContentProvider>
  );
}
