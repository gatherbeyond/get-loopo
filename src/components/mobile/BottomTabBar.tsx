import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated",
        "flex items-center justify-around px-2 py-2",
        className
      )}
      style={{ 
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
        minHeight: "70px"
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full",
              "touch-target transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -inset-2 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 block w-6 h-6">{tab.icon}</span>
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

export { BottomTabBar };
export type { TabItem };
