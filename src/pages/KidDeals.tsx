import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coins, Target, CheckCircle, Loader2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MobileCard } from "@/components/mobile/MobileCard";
import { MobileButton } from "@/components/mobile/MobileButton";
import { ProgressBar } from "@/components/mobile/ProgressBar";
import { EmptyState } from "@/components/mobile/EmptyState";
import { KidBottomNav } from "@/components/kid/KidBottomNav";

interface KidDeal {
  id: string;
  item_name: string;
  real_cost: number;
  credits_goal: number;
  credits_paid: number;
  status: string;
  parent_note?: string;
  created_at: string;
}

const KidDeals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deals, setDeals] = React.useState<KidDeal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDeals = async () => {
      if (!user?.kidId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("parent_deals")
        .select("*")
        .eq("kid_id", user.kidId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setDeals(data as KidDeal[]);
      }
      setLoading(false);
    };
    void fetchDeals();
  }, [user?.kidId]);

  const activeDeals = deals.filter((d) => d.status === "active");
  const completedDeals = deals.filter((d) => d.status === "completed");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 pt-safe-top">
        <div className="flex items-center gap-3 py-4">
          <MobileButton
            variant="ghost"
            size="icon"
            onClick={() => navigate("/kid")}
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </MobileButton>
          <div>
            <h1 className="text-kid-header font-display font-bold text-foreground">
              My Deals
            </h1>
            <p className="text-sm font-body text-muted-foreground">
              Track your progress
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : deals.length === 0 ? (
          <EmptyState
            title="No deals yet"
            description="Your parent can create a deal for you"
          />
        ) : (
          <AnimatePresence>
            {/* Active Deals */}
            {activeDeals.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h2 className="font-display font-bold text-foreground text-lg">
                  In Progress
                </h2>
                {activeDeals.map((deal) => {
                  const remaining = deal.credits_goal - deal.credits_paid;
                  return (
                    <MobileCard
                      key={deal.id}
                      variant="default"
                      padding="default"
                      className="space-y-3"
                    >
                      <div>
                        <h3 className="font-display font-bold text-xl text-foreground">
                          {deal.item_name}
                        </h3>
                        {deal.parent_note && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            {deal.parent_note}
                          </p>
                        )}
                      </div>

                      <ProgressBar
                        variant="gold"
                        size="lg"
                        showPercentage={true}
                        value={deal.credits_paid}
                        max={deal.credits_goal}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-accent-gold">
                          <Coins className="w-5 h-5" />
                          <span className="font-bold font-display">
                            {deal.credits_paid}
                          </span>
                        </div>
                        <span className="text-sm font-body text-muted-foreground">
                          of {deal.credits_goal} needed
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground font-body">
                        {remaining} credits to go
                      </p>

                      <MobileCard
                        variant="tinted"
                        padding="sm"
                        className="flex items-center gap-2"
                      >
                        <Target className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-body text-muted-foreground">
                          Keep completing missions to fill this up!
                        </span>
                      </MobileCard>
                    </MobileCard>
                  );
                })}
              </motion.section>
            )}

            {/* Completed Deals */}
            {completedDeals.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-foreground text-lg">
                    Completed
                  </h2>
                </div>
                {completedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-muted/50 rounded-2xl p-4 opacity-80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <h3 className="font-display font-bold text-foreground">
                        {deal.item_name}
                      </h3>
                    </div>
                    <p className="text-sm font-body text-success">
                      Fully earned!
                    </p>
                  </div>
                ))}
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </main>

      <KidBottomNav
        activeTab="home"
        onTabChange={(tab) => {
          if (tab === "home") navigate("/kid");
          else if (tab === "missions") navigate("/kid/missions");
          else if (tab === "shop") navigate("/kid/shop");
          else if (tab === "rewards") navigate("/kid/rewards");
        }}
      />
    </div>
  );
};

export default KidDeals;
