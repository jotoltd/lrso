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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl pb-safe shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-[60px] px-2">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 transition-all cursor-pointer"
            >
              <span className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200 ${
                isActive ? "bg-lrso-blue-600 shadow-md shadow-lrso-blue-200" : ""
              }`}>
                <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? "text-lrso-blue-700" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
