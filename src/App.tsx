import { useEffect, lazy, Suspense } from "react";
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
import { VenuePage } from "./components/VenuePage";
import { NotFound } from "./components/NotFound";
import { usePageMeta } from "./hooks/usePageMeta";
import { SiteContentProvider, useSiteContent } from "./context/SiteContentContext";

import { Home } from "./components/Home";

const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel }))
);

const OG_IMAGE = "/logo-512.png";

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
  usePageMeta({
    title: "LRSO Ltd | School Facility Hire & Lettings Management",
    description: "LRSO manages school and sports club facilities for community hire across the UK. Book sports halls, pitches, studios and more — evenings, weekends and school holidays.",
    canonicalPath: "/",
    ogImage: OG_IMAGE,
  });
  const handleEnquire = (subject: string) => {
    navigate(`/contact?subject=${encodeURIComponent(subject)}`);
  };
  return <Home handleEnquire={handleEnquire} />;
}

function VenuesPage() {
  const navigate = useNavigate();
  usePageMeta({
    title: "Venues for Hire | LRSO",
    description: "Browse venues for hire — sports halls, 3G pitches, dance and drama studios, classrooms and more at schools across the UK.",
    canonicalPath: "/venues",
    ogImage: OG_IMAGE,
  });
  return (
    <VenueExplorer
      onVenueSelect={(slug) => navigate(`/venues/${slug}`)}
    />
  );
}

function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  if (!slug) return null;
  return (
    <VenuePage
      venueSlug={slug}
      onBack={() => navigate("/venues")}
    />
  );
}

function ContactPage() {
  const [searchParams] = useSearchParams();
  usePageMeta({
    title: "Contact Us | LRSO",
    description: "Contact LRSO about hiring school facilities — sports halls, pitches and studios available for community use.",
    canonicalPath: "/contact",
    ogImage: OG_IMAGE,
  });
  const initialSubject = searchParams.get("subject") || "";
  return <ContactSection initialSubject={initialSubject} />;
}

function PartnershipPage() {
  const { value } = useSiteContent();
  usePageMeta({
    title: "Partner With Us | LRSO",
    description: "Partner with LRSO — we generate much-needed revenue for schools and sports clubs by managing and marketing their facilities for community lettings.",
    canonicalPath: "/partnership",
    ogImage: OG_IMAGE,
  });
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
          <Route path="/admin" element={<Suspense fallback={<div className="min-h-screen bg-slate-50" />}><AdminPanel /></Suspense>} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/venues/:slug" element={<VenueDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/partnership" element={<PartnershipPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SiteContentProvider>
  );
}
