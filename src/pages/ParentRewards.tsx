import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ParentTopBar, ParentBottomNav } from "@/components/parent";
import { Store } from "lucide-react";
import { FamilyRewardsTab } from "@/components/parent/family-rewards/FamilyRewardsTab";

type SubTab = "marketplace" | "family";

const ParentRewards: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("marketplace");

  return (
    <div className="min-h-screen bg-background-tint">
      <div className="mx-auto max-w-md min-h-screen relative overflow-hidden flex flex-col">
        <ParentTopBar familyName="Rewards" initial="R" />

        {/* Sub-tabs */}
        <div className="flex border-b border-border bg-card sticky top-0 z-10">
          {(["marketplace", "family"] as SubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "flex-1 py-3 text-sm font-body font-semibold capitalize transition-colors relative",
                activeSubTab === tab
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab === "marketplace" ? "Marketplace" : "Family"}
              {activeSubTab === tab && (
                <motion.div
                  layoutId="rewardsSubTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeSubTab === "marketplace" ? (
          <main className="flex-1 flex items-center justify-center px-8 py-24">
            <div className="text-center space-y-4">
              <Store className="w-16 h-16 text-muted-foreground/40 mx-auto" />
              <p className="text-lg font-display font-bold text-muted-foreground">
                Coming Soon
              </p>
              <p className="text-sm font-body text-muted-foreground/70">
                Browse and manage marketplace rewards here.
              </p>
            </div>
          </main>
        ) : (
          <FamilyRewardsTab />
        )}

        <ParentBottomNav activeTab="rewards" />
      </div>
    </div>
  );
};

export default ParentRewards;
