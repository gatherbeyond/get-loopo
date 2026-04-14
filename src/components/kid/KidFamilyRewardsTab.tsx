import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import loopoMascot from "@/assets/loopo-mascot.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FamilyReward {
  id: string;
  title: string;
  credits_cost: number;
}

interface KidFamilyRewardsTabProps {
  credits: number;
  familyId: string | null;
}

const KidFamilyRewardsTab: React.FC<KidFamilyRewardsTabProps> = ({ credits, familyId }) => {
  const { user } = useAuth();
  const kidId = user?.kidId;

  const [rewards, setRewards] = useState<FamilyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRewardIds, setPendingRewardIds] = useState<Set<string>>(new Set());
  const [selectedReward, setSelectedReward] = useState<FamilyReward | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!familyId || !kidId) { setLoading(false); return; }

    const [rewardsRes, pendingRes] = await Promise.all([
      supabase
        .from("family_rewards")
        .select("id, title, credits_cost")
        .eq("family_id", familyId)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("family_reward_requests")
        .select("family_reward_id")
        .eq("kid_id", kidId)
        .eq("status", "requested"),
    ]);

    setRewards(rewardsRes.data ?? []);
    setPendingRewardIds(new Set((pendingRes.data ?? []).map((r) => r.family_reward_id)));
    setLoading(false);
  }, [familyId, kidId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequest = (reward: FamilyReward) => {
    setSelectedReward(reward);
    setSheetOpen(true);
  };

  const confirmRequest = async () => {
    if (!selectedReward || !kidId || submitting) return;
    setSubmitting(true);

    const { error } = await supabase.from("family_reward_requests").insert({
      kid_id: kidId,
      family_reward_id: selectedReward.id,
      status: "requested",
    });

    if (error) {
      toast.error("Something went wrong. Try again.");
    } else {
      setPendingRewardIds((prev) => new Set(prev).add(selectedReward.id));
      toast.success("Request sent to your parent!");
    }

    setSheetOpen(false);
    setSubmitting(false);
    setSelectedReward(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
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
        <p className="font-body text-sm text-muted-foreground">
          Ask your parent to set up Family Rewards
        </p>
      </div>
    );
  }

  const balanceAfter = selectedReward ? credits - selectedReward.credits_cost : 0;
  const isLowBalance = balanceAfter >= 0 && balanceAfter < 200;

  return (
    <>
      <div className="px-4 pt-4 pb-8 space-y-3">
        {rewards.map((reward) => {
          const isPending = pendingRewardIds.has(reward.id);
          const canAfford = credits >= reward.credits_cost;
          const shortfall = reward.credits_cost - credits;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-base text-foreground truncate">
                  {reward.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <CoinIcon size={16} />
                  <span className="font-body text-sm font-semibold text-accent-gold">
                    {reward.credits_cost.toLocaleString()}
                  </span>
                </div>
              </div>

              {isPending ? (
                <span className="px-4 py-2 rounded-xl bg-muted font-display font-bold text-xs text-muted-foreground">
                  Pending
                </span>
              ) : canAfford ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRequest(reward)}
                  className="px-4 py-2 rounded-xl bg-primary font-display font-bold text-xs text-primary-foreground"
                >
                  Request
                </motion.button>
              ) : (
                <span className="text-xs font-body text-muted-foreground whitespace-nowrap">
                  Need {shortfall.toLocaleString()} more
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
              Request Reward?
            </SheetTitle>
          </SheetHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="bg-background-tint rounded-2xl p-4 space-y-3">
                <p className="font-display font-bold text-lg text-foreground">
                  {selectedReward.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-body text-sm text-muted-foreground">Cost:</span>
                  <CoinIcon size={16} />
                  <span className="font-display font-bold text-sm text-accent-gold">
                    {selectedReward.credits_cost.toLocaleString()} credits
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Your balance:</span>
                  <span className="font-display font-bold text-sm text-foreground">
                    {credits.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">After:</span>
                  <span className="font-display font-bold text-sm text-foreground">
                    {balanceAfter.toLocaleString()}
                  </span>
                </div>
                {isLowBalance && (
                  <p className="font-body text-xs text-accent-gold font-semibold">
                    ⚠️ Your balance will be low after this request
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={confirmRequest}
                disabled={submitting}
                className="w-full h-[52px] rounded-2xl bg-primary font-display font-bold text-base text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Request"}
              </motion.button>

              <button
                onClick={() => setSheetOpen(false)}
                className="w-full py-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export { KidFamilyRewardsTab };
