import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import { Loader2, Star, Trophy, Clock } from "lucide-react";
import { CoinIcon } from "@/components/mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from "date-fns";
import loopoMascot from "@/assets/loopo-mascot.png";

interface FamilyRewardRequest {
  id: string;
  family_reward_id: string;
  status: string;
  requested_at: string | null;
  approved_at: string | null;
  fulfilled_at: string | null;
  rewardTitle: string;
  creditsCost: number;
}

const KidFamilyRewardsHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const kidId = user?.kidId;

  const [items, setItems] = useState<FamilyRewardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!kidId) { setLoading(false); return; }

    const { data: requests } = await supabase
      .from("family_reward_requests")
      .select("id, family_reward_id, status, requested_at, approved_at, fulfilled_at")
      .eq("kid_id", kidId)
      .in("status", ["requested", "approved", "fulfilled"])
      .order("requested_at", { ascending: false });

    if (!requests || requests.length === 0) { setItems([]); setLoading(false); return; }

    const rewardIds = [...new Set(requests.map((r) => r.family_reward_id))];
    const { data: rewards } = await supabase
      .from("family_rewards")
      .select("id, title, credits_cost")
      .in("id", rewardIds);

    const rewardsMap = new Map((rewards || []).map((r) => [r.id, r]));

    setItems(
      requests.map((req) => {
        const reward = rewardsMap.get(req.family_reward_id);
        return {
          ...req,
          rewardTitle: reward?.title || "Reward",
          creditsCost: reward?.credits_cost || 0,
        };
      })
    );
    setLoading(false);
  }, [kidId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <motion.img
          src={loopoMascot}
          alt="Loopo mascot"
          className="w-[120px] h-[120px] object-contain mb-6"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          No Family Rewards Yet
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Browse Family Rewards in the Shop
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/kid/shop")}
          className="h-[52px] px-8 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/30"
        >
          Go to Shop
        </motion.button>
      </div>
    );
  }

  const ready = items.filter((i) => i.status === "approved");
  const pending = items.filter((i) => i.status === "requested");
  const done = items.filter((i) => i.status === "fulfilled");

  return (
    <div className="px-4 pt-4 pb-8 space-y-5">
      {ready.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-accent-gold" /> Ready to Claim
          </h2>
          <div className="space-y-2">
            {ready.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-success/30 p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground truncate">
                      {item.rewardTitle}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CoinIcon size={14} />
                      <span className="font-body text-xs font-semibold text-accent-gold">
                        {item.creditsCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" /> Ready
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Show this to your parent to claim your reward
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" /> Waiting for Approval
          </h2>
          <div className="space-y-2">
            {pending.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-3.5 shadow-sm flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-foreground truncate">
                    {item.rewardTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <CoinIcon size={14} />
                      <span className="font-body text-xs font-semibold text-accent-gold">
                        {item.creditsCost.toLocaleString()}
                      </span>
                    </div>
                    {item.requested_at && (
                      <span className="font-body text-xs text-muted-foreground">
                        · {formatDistanceToNow(new Date(item.requested_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                  Pending
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-base text-foreground mb-2 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-muted-foreground" /> Done
          </h2>
          <div className="space-y-2">
            {done.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-3.5 shadow-sm flex items-center gap-3 opacity-70"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-foreground truncate">
                    {item.rewardTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <CoinIcon size={14} />
                      <span className="font-body text-xs font-semibold text-accent-gold">
                        {item.creditsCost.toLocaleString()}
                      </span>
                    </div>
                    {item.fulfilled_at && (
                      <span className="font-body text-xs text-muted-foreground">
                        · Claimed on {format(new Date(item.fulfilled_at), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <Trophy className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export { KidFamilyRewardsHistory };
