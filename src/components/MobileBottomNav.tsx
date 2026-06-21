import React from "react";
import { Home, MapPin, Users, MessageCircle } from "lucide-react";

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "venues", label: "Venues", icon: MapPin },
    { id: "partnership", label: "Join", icon: Users },
    { id: "contact", label: "Contact", icon: MessageCircle },
  ];

  const handleClick = (id: string) => {
    setCurrentTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive
                  ? "text-lrso-blue-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? "text-lrso-blue-700" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-lrso-blue-600 to-lrso-crimson-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
