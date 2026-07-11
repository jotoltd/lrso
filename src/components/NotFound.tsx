import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import logoImage from "../assets/lrso_logo.jpg";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center h-20 w-auto rounded-2xl bg-white shadow-sm p-3 mb-6">
            <Logo className="h-24 w-auto" showText={false} imageSrc={logoImage} />
          </div>
          <h1 className="font-display text-6xl font-extrabold text-slate-900 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Page Not Found</h2>
          <p className="text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-xl bg-lrso-blue-600 hover:bg-lrso-blue-700 px-6 py-3 text-sm font-bold text-white transition-colors cursor-pointer shadow-sm"
          >
            <Home className="h-4 w-4" /> Go Home
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Need help? <a href="/contact" className="text-lrso-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};
