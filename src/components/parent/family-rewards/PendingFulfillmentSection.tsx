import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, CheckCircle, Loader2 } from "lucide-react";
import { resolveAvatar } from "@/lib/avatars";
import { formatDistanceToNow } from "date-fns";
import { CoinIcon } from "@/components/mobile";

interface FulfillmentItem {
  id: string;
  kidName: string;
  kidAvatar: string;
  rewardTitle: string;
  creditsCost: number;
  approvedAt: string;
}

interface PendingFulfillmentSectionProps {
  familyId: string | null;
}

const PendingFulfillmentSection: React.FC<PendingFulfillmentSectionProps> = ({ familyId }) => {
  const [items, setItems] = useState<FulfillmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const fetchApproved = useCallback(async () => {
    if (!familyId) { setLoading(false); return; }

    const { data: kids } = await supabase
      .from("kids")
      .select("id, name, avatar")
      .eq("family_id", familyId);

    if (!kids || kids.length === 0) { setLoading(false); return; }

    const kidIds = kids.map((k) => k.id);
    const kidsMap = new Map(kids.map((k) => [k.id, k]));

    const { data: requests } = await supabase
      .from("family_reward_requests")
      .select("id, kid_id, family_reward_id, status, approved_at")
      .in("kid_id", kidIds)
      .eq("status", "approved");

    if (!requests || requests.length === 0) { setItems([]); setLoading(false); return; }

    const rewardIds = [...new Set(requests.map((r) => r.family_reward_id))];
    const { data: rewards } = await supabase
      .from("family_rewards")
      .select("id, title, credits_cost")
      .in("id", rewardIds);

    const rewardsMap = new Map((rewards || []).map((r) => [r.id, r]));

    const mapped: FulfillmentItem[] = requests.map((req) => {
      const kid = kidsMap.get(req.kid_id);
      const reward = rewardsMap.get(req.family_reward_id);
      return {
        id: req.id,
        kidName: kid?.name || "Unknown",
        kidAvatar: resolveAvatar(kid?.avatar || ""),
        rewardTitle: reward?.title || "Reward",
        creditsCost: reward?.credits_cost || 0,
        approvedAt: req.approved_at || "",
      };
    });

    setItems(mapped);
    setLoading(false);
  }, [familyId]);

  useEffect(() => { fetchApproved(); }, [fetchApproved]);

  const handleFulfill = async (id: string) => {
    setFulfillingId(id);
    await supabase
      .from("family_reward_requests")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", id);

    setItems((prev) => prev.filter((i) => i.id !== id));
    setFulfillingId(null);
    toast.success("Reward fulfilled!");
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="px-4 pt-6 pb-4">
      <h3 className="font-display font-bold text-lg text-foreground mb-3">
        Pending Fulfillment
      </h3>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -60 }}
              className="p-4 rounded-2xl bg-card border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {item.kidAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {item.kidName}
                  </p>
                  <p className="font-body text-sm text-muted-foreground truncate">
                    {item.rewardTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CoinIcon size={16} />
                  <span className="text-sm font-body font-semibold text-accent-gold">
                    {item.creditsCost}
                  </span>
                  {item.approvedAt && (
                    <span className="text-xs font-body text-muted-foreground ml-2">
                      Approved {formatDistanceToNow(new Date(item.approvedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFulfill(item.id)}
                  disabled={fulfillingId === item.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary font-display font-bold text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {fulfillingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark as Fulfilled
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export { PendingFulfillmentSection };
