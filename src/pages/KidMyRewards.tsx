import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Copy, Check, Gift, Loader2,
  Handshake, Coins, Target, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon, MobileButton } from "@/components/mobile";
import { MobileCard } from "@/components/mobile/MobileCard";
import { MobileInput } from "@/components/mobile/MobileInput";
import { ProgressBar } from "@/components/mobile";
import { KidBottomNav, KidNavTab } from "@/components/kid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import loopoMascot from "@/assets/loopo-mascot.png";
import { KidFamilyRewardsHistory } from "@/components/kid/KidFamilyRewardsHistory";
import { formatDistanceToNow } from "date-fns";

interface Redemption {
  id: string;
  product_name: string;
  product_image: string | null;
  cost_credits: number;
  status: string;
  redemption_code: string | null;
  approved_at: string | null;
  used_at: string | null;
  requested_at: string | null;
}

interface KidDeal {
  id: string;
  item_name: string;
  real_cost: number | null;
  credits_goal: number | null;
  credits_paid: number;
  status: string;
  parent_note?: string;
  kid_note?: string;
  created_at: string;
}

type RewardsSubTab = "codes" | "family" | "deal";

const KidMyRewards: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("rewards");
  const [activeSubTab, setActiveSubTab] = React.useState<RewardsSubTab>("codes");

  // Codes state
  const [rewards, setRewards] = React.useState<Redemption[]>([]);
  const [loadingCodes, setLoadingCodes] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [confirmUsedId, setConfirmUsedId] = React.useState<string | null>(null);

  // Deal state
  const [deal, setDeal] = React.useState<KidDeal | null>(null);
  const [familyId, setFamilyId] = React.useState<string | null>(null);
  const [loadingDeal, setLoadingDeal] = React.useState(true);
  const [itemName, setItemName] = React.useState("");
  const [kidNote, setKidNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch codes
  React.useEffect(() => {
    if (!user?.kidId) return;
    const fetchRedemptions = async () => {
      setLoadingCodes(true);
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("kid_id", user.kidId!)
        .order("requested_at", { ascending: false });
      if (error) {
        toast({ title: "Error loading rewards", variant: "destructive" });
      } else {
        setRewards(data || []);
      }
      setLoadingCodes(false);
    };
    fetchRedemptions();
  }, [user?.kidId]);

  // Fetch deal
  const fetchDeal = React.useCallback(async () => {
    if (!user?.kidId) return;
    setLoadingDeal(true);
    try {
      const { data: kid } = await supabase
        .from("kids")
        .select("family_id")
        .eq("id", user.kidId)
        .maybeSingle();
      if (kid) setFamilyId(kid.family_id);

      const { data } = await supabase
        .from("parent_deals")
        .select("*")
        .eq("kid_id", user.kidId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setDeal((data as KidDeal) ?? null);
    } finally {
      setLoadingDeal(false);
    }
  }, [user?.kidId]);

  React.useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const readyRewards = rewards.filter(r => r.status === "approved");
  const pendingRewards = rewards.filter(r => r.status === "pending");
  const usedRewards = rewards.filter(r => r.status === "used");

  const handleCopyCode = async (rewardId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(rewardId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy the code manually", variant: "destructive" });
    }
  };

  const confirmMarkAsUsed = async () => {
    if (!confirmUsedId) return;
    const { error } = await supabase
      .from("redemptions")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", confirmUsedId);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      setRewards(prev =>
        prev.map(r => r.id === confirmUsedId ? { ...r, status: "used", used_at: new Date().toISOString() } : r)
      );
      toast({ title: "Marked as used! ✓" });
    }
    setConfirmUsedId(null);
  };

  const handleDealSubmit = async () => {
    if (!user?.kidId || !familyId || !itemName.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("parent_deals").insert({
        kid_id: user.kidId,
        family_id: familyId,
        item_name: itemName.trim(),
        kid_note: kidNote.trim() || null,
        status: "requested",
        credits_paid: 0,
      });
      if (error) throw error;
      toast({ title: "Request sent to your parent! 🤝" });
      setItemName("");
      setKidNote("");
      await fetchDeal();
    } catch (err) {
      toast({
        title: "Could not send request",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/kid");
    if (tab === "missions") navigate("/kid");
    if (tab === "shop") navigate("/kid/shop");
    if (tab === "rewards") navigate("/kid/rewards");
  };

  const formatRelative = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderRewardCard = (reward: Redemption) => {
    const isCopied = copiedId === reward.id;
    return (
      <motion.div
        key={reward.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-card rounded-2xl border border-border p-4 shadow-sm",
          reward.status === "used" && "opacity-70"
        )}
      >
        <div className="flex gap-3">
          <img
            src={reward.product_image || "/placeholder.svg"}
            alt={reward.product_name}
            className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-base text-foreground line-clamp-2">
                {reward.product_name}
              </h3>
              <div className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold",
                reward.status === "approved" && "bg-success/10 text-success",
                reward.status === "pending" && "bg-warning/10 text-warning",
                reward.status === "used" && "bg-muted text-muted-foreground"
              )}>
                {reward.status === "approved" && "✅ Ready"}
                {reward.status === "pending" && "⏳ Pending"}
                {reward.status === "used" && "✓ Used"}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <CoinIcon size={14} />
              <span className="font-body text-xs text-muted-foreground">
                {reward.cost_credits.toLocaleString()} credits
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {reward.status === "approved" && `Approved ${formatRelative(reward.approved_at)}`}
              {reward.status === "pending" && "Waiting for parent approval"}
              {reward.status === "used" && `Used ${formatRelative(reward.used_at)}`}
            </p>
          </div>
        </div>

        {reward.status === "approved" && reward.redemption_code && (
          <div className="mt-4">
            <div className="bg-background-tint border border-dashed border-primary rounded-xl p-4">
              <p className="font-body text-xs text-muted-foreground mb-2">Your Code:</p>
              <p className="font-display font-bold text-lg text-primary tracking-wider text-center mb-3">
                {reward.redemption_code}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyCode(reward.id, reward.redemption_code!)}
                className={cn(
                  "w-full h-10 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2",
                  isCopied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
                )}
              >
                {isCopied ? <><Check className="w-4 h-4" /> Copied! ✓</> : <><Copy className="w-4 h-4" /> Copy Code 📋</>}
              </motion.button>
            </div>
            <button
              onClick={() => setConfirmUsedId(reward.id)}
              className="w-full h-10 mt-3 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
            >
              I've used this code
            </button>
          </div>
        )}

        {reward.status === "pending" && (
          <div className="mt-4 bg-warning/10 rounded-xl p-3 text-center">
            <p className="font-body text-sm text-warning">⏳ Waiting for parent approval</p>
            <p className="font-body text-xs text-muted-foreground mt-1">We'll notify you when approved!</p>
          </div>
        )}

        {reward.status === "used" && reward.redemption_code && (
          <div className="mt-3 bg-muted/50 rounded-lg p-3">
            <p className="font-body text-xs text-muted-foreground mb-1">Code (for reference):</p>
            <p className="font-mono text-sm text-muted-foreground tracking-wider">{reward.redemption_code}</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderDealContent = () => {
    if (loadingDeal) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      );
    }

    if (deal && deal.status === "requested") {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <Handshake className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Request Sent!</h2>
              <p className="font-display font-bold text-primary mt-1">{deal.item_name}</p>
            </div>
            <div className="bg-card rounded-xl p-3">
              <p className="font-body text-sm text-muted-foreground">
                Waiting for your parent to set the deal terms. They'll let you know soon! 👀
              </p>
            </div>
            {deal.kid_note && (
              <p className="italic text-muted-foreground text-sm">"{deal.kid_note}"</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wide">How it works</p>
            {[
              { icon: "🛍️", text: "Your parent gets you the thing" },
              { icon: "🚀", text: "You do missions to earn it back" },
              { icon: "✅", text: "Once you've earned enough, it's yours for real!" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <p className="font-body text-sm text-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (deal && deal.status === "active" && deal.credits_goal) {
      const remaining = Math.max(deal.credits_goal - deal.credits_paid, 0);
      const percent = Math.min(Math.round((deal.credits_paid / deal.credits_goal) * 100), 100);
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-primary rounded-2xl p-5 space-y-4">
            <div>
              <p className="font-body text-xs text-primary-foreground/70 uppercase tracking-wide mb-1">Your Deal</p>
              <h2 className="font-display font-bold text-2xl text-primary-foreground">{deal.item_name}</h2>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-accent-gold" />
                  <span className="font-display font-bold text-primary-foreground">
                    {deal.credits_paid.toLocaleString()} / {deal.credits_goal.toLocaleString()}
                  </span>
                </div>
                <span className="font-display font-bold text-accent-gold">{percent}%</span>
              </div>
              <ProgressBar variant="gold" size="lg" value={deal.credits_paid} max={deal.credits_goal} />
              <p className="font-body text-sm text-primary-foreground/80 mt-2 text-center">
                {remaining.toLocaleString()} credits to go! 💪
              </p>
            </div>
          </div>

          {deal.parent_note && (
            <div className="bg-card border border-border rounded-2xl p-4 flex gap-3">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">Parent's note</p>
                <p className="font-body text-sm text-foreground italic">"{deal.parent_note}"</p>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
            <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-muted-foreground">
              Keep completing missions to fill this up. You're doing great!
            </p>
          </div>
        </motion.div>
      );
    }

    if (deal && deal.status === "completed") {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-primary rounded-2xl p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="font-display font-bold text-2xl text-primary-foreground">You did it!</h2>
              <p className="font-display font-bold text-accent-gold text-lg mt-1">{deal.item_name}</p>
              <p className="font-body text-sm text-primary-foreground/80 mt-2">
                You said you'd do it, and you did. That's huge.
              </p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4 flex justify-around">
              {[
                { label: "Credits earned", value: (deal.credits_goal ?? 0).toLocaleString(), icon: "🪙" },
                { label: "Missions done", value: String(Math.ceil((deal.credits_goal ?? 0) / 400)), icon: "🚀" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-display font-bold text-xl text-primary-foreground">{s.value}</div>
                  <div className="font-body text-xs text-primary-foreground/60">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-accent-gold/20 border border-accent-gold/40 rounded-xl p-3">
              <div className="text-2xl mb-1">🏅</div>
              <p className="font-display font-bold text-accent-gold text-sm">Deal Keeper</p>
              <p className="font-body text-xs text-primary-foreground/70">Badge unlocked for completing your first deal!</p>
            </div>
          </div>
        </motion.div>
      );
    }

    // No deal — request form
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="bg-primary rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-5 pointer-events-none">🤝</div>
          <h2 className="font-display font-bold text-xl text-primary-foreground mb-3">How it works</h2>
          {[
            { icon: "🛍️", text: "Your parent gets you the thing" },
            { icon: "🚀", text: "You do missions to earn it back" },
            { icon: "✅", text: "Once you've earned enough, it's yours for real!" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <span className="text-xl">{s.icon}</span>
              <p className="font-body text-sm text-primary-foreground/90">{s.text}</p>
            </div>
          ))}
        </div>

        <MobileInput
          label="What do you want?"
          placeholder="e.g. Basketball shoes, New headphones"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <MobileInput
          label="Why do you want it? (optional)"
          placeholder="Tell your parent why this matters to you"
          value={kidNote}
          onChange={(e) => setKidNote(e.target.value)}
        />

        <p className="font-body text-xs text-muted-foreground text-center px-4">
          Make sure you're ready to follow through — missions await! 💪
        </p>

        <MobileButton
          variant="primary"
          fullWidth
          disabled={!itemName.trim() || submitting}
          onClick={handleDealSubmit}
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send to Parent 🤝"}
        </MobileButton>
      </motion.div>
    );
  };

  const hasRewards = rewards.length > 0;

  const subTabs: { key: RewardsSubTab; label: string }[] = [
    { key: "codes", label: "Codes" },
    { key: "family", label: "Family" },
    { key: "deal", label: "My Deal" },
  ];

  return (
    <div className="min-h-screen bg-card pb-24">
      {/* Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 12px)",
          height: "calc(60px + max(env(safe-area-inset-top), 12px))",
        }}
      >
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button onClick={() => navigate("/kid")} className="w-11 h-11 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-display font-bold text-2xl text-foreground">My Rewards 🎁</h1>
          <div className="w-11 h-11" />
        </div>
      </header>

      <div style={{ height: "calc(60px + max(env(safe-area-inset-top), 12px))" }} />

      {/* Sub-tabs */}
      <div className="flex border-b border-border bg-card sticky top-0 z-30">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={cn(
              "flex-1 py-3 text-sm font-body font-semibold transition-colors relative",
              activeSubTab === tab.key ? "text-primary" : "text-muted-foreground"
            )}
          >
            {tab.label}
            {activeSubTab === tab.key && (
              <motion.div
                layoutId="rewardsSubTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4 pb-8">
        {activeSubTab === "family" && (
          <KidFamilyRewardsHistory />
        )}

        {activeSubTab === "deal" && renderDealContent()}

        {activeSubTab === "codes" && (
          <>
            {loadingCodes ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !hasRewards ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo mascot"
                  className="w-[140px] h-[140px] object-contain mb-6"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">No rewards yet!</h2>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  Redeem credits in the Shop
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/kid/shop")}
                  className="h-[52px] px-8 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/30"
                >
                  Go to Shop
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                {readyRewards.length > 0 && (
                  <section>
                    <h2 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-success" /> Ready to Use ✅
                    </h2>
                    <div className="space-y-3">{readyRewards.map(renderRewardCard)}</div>
                  </section>
                )}
                {pendingRewards.length > 0 && (
                  <section>
                    <h2 className="font-display font-bold text-lg text-foreground mb-3">Pending Approval ⏳</h2>
                    <div className="space-y-3">{pendingRewards.map(renderRewardCard)}</div>
                  </section>
                )}
                {usedRewards.length > 0 && (
                  <section>
                    <h2 className="font-display font-bold text-lg text-foreground mb-3">Used ✓</h2>
                    <div className="space-y-3">{usedRewards.map(renderRewardCard)}</div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmUsedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmUsedId(null)}
              className="fixed inset-0 bg-foreground/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl p-6 w-[calc(100%-48px)] max-w-sm shadow-xl"
            >
              <h3 className="font-display font-bold text-xl text-foreground text-center mb-2">Mark as Used?</h3>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmUsedId(null)}
                  className="flex-1 h-11 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkAsUsed}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm"
                >
                  Yes, I used it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMyRewards;
