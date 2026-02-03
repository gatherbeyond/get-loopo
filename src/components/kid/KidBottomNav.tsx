import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Rocket, ShoppingBag, Star } from "lucide-react";

type KidNavTab = "home" | "missions" | "shop" | "wishlist";

interface KidBottomNavProps {
  activeTab: KidNavTab;
  onTabChange: (tab: KidNavTab) => void;
  className?: string;
}

const tabs: { id: KidNavTab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "missions", label: "Missions", icon: Rocket },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "wishlist", label: "Wishlist", icon: Star },
];

const KidBottomNav: React.FC<KidBottomNavProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border",
        "flex items-center justify-around",
        className
      )}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        height: "calc(60px + max(env(safe-area-inset-bottom), 8px))",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 h-full",
              "touch-target transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <div className="relative">
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="kidNavIndicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-7 h-7 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
            </div>
            <span
              className={cn(
                "text-xs font-body font-semibold transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export { KidBottomNav };
export type { KidNavTab };
