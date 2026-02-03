import React from "react";
import { motion } from "framer-motion";
import { Home, ListChecks, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "home" | "tasks" | "analytics" | "settings";

interface NavTab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const navTabs: NavTab[] = [
  { id: "home", label: "Home", icon: <Home className="w-6 h-6" /> },
  { id: "tasks", label: "Tasks", icon: <ListChecks className="w-6 h-6" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-6 h-6" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-6 h-6" /> },
];

interface ParentBottomNavProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const ParentBottomNav: React.FC<ParentBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card border-t border-border",
        "flex items-center justify-around"
      )}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        height: "calc(60px + max(env(safe-area-inset-bottom), 8px))",
      }}
    >
      {navTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center gap-1",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:bg-muted/50"
            )}
          >
            {/* Active Indicator */}
            <div className="relative">
              {isActive && (
                <motion.div
                  layoutId="parentNavIndicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.icon}
              </div>
            </div>
            <span
              className={cn(
                "text-xs font-body transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
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

export { ParentBottomNav };
export type { TabId };
