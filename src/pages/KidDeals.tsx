import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coins,
  Target,
  CheckCircle,
  Loader2,
  Handshake,
} from "lucide-react";
import { MobileCard, MobileButton, ProgressBar } from "@/components/mobile";
import { MobileInput } from "@/components/mobile/MobileInput";
import { KidBottomNav, type KidNavTab } from "@/components/kid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

const KidDeals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deal, setDeal] = useState<KidDeal | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [kidNote, setKidNote] = useState("");

  const fetchDeal = useCallback(async () => {
    if (!user?.kidId) return;
    setLoading(true);
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
      setLoading(false);
    }
  }, [user?.kidId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const handleSubmit = async () => {
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
      toast({ title: "Request sent!" });
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

  const renderContent = () => {
    if (loading) {
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
                { label: "Missions done", value: Math.ceil((deal.credits_goal ?? 0) / 400), icon: "🚀" },
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
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send to Parent 🤝"}
        </MobileButton>
      </motion.div>
    );
  };

  const activeTab: KidNavTab = "rewards";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/kid")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">
              My Deal
            </h1>
            <p className="text-xs text-muted-foreground">
              Earn it back through missions
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4">{renderContent()}</main>

      <KidBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "home") navigate("/kid");
          else if (tab === "missions") navigate("/kid");
          else if (tab === "shop") navigate("/kid/shop");
          else if (tab === "rewards") navigate("/kid/rewards");
        }}
      />
    </div>
  );
};

export default KidDeals;
