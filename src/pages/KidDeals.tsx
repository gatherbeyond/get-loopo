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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MobileCard variant="tinted" padding="lg">
            <div className="text-center">
              <Handshake className="w-12 h-12 text-primary mx-auto" />
              <h2 className="font-display font-bold text-xl mt-3">
                Request sent!
              </h2>
              <p className="text-primary font-bold mt-1">{deal.item_name}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Waiting for your parent to set the deal terms.
              </p>
              {deal.kid_note && (
                <p className="italic text-muted-foreground text-sm mt-3">
                  "{deal.kid_note}"
                </p>
              )}
            </div>
          </MobileCard>
        </motion.div>
      );
    }

    if (deal && deal.status === "active" && deal.credits_goal) {
      const remaining = Math.max(deal.credits_goal - deal.credits_paid, 0);
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MobileCard variant="primary" padding="lg">
            <h2 className="font-display font-bold text-xl text-white">
              {deal.item_name}
            </h2>
            <div className="mt-4">
              <ProgressBar
                variant="gold"
                size="lg"
                showPercentage
                value={deal.credits_paid}
                max={deal.credits_goal}
              />
            </div>
            <div className="flex items-center justify-between mt-4 text-white">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-accent-gold" />
                <span className="font-display font-bold">
                  {deal.credits_paid} / {deal.credits_goal}
                </span>
              </div>
              <span className="text-sm text-white/70">
                {remaining} credits to go
              </span>
            </div>
          </MobileCard>

          <div className="mt-3">
            <MobileCard variant="tinted" padding="default">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Keep completing missions to fill this up!
                </p>
              </div>
            </MobileCard>
          </div>
        </motion.div>
      );
    }

    if (deal && deal.status === "completed") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MobileCard variant="tinted" padding="lg" centered>
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h2 className="font-display font-bold text-xl mt-3">You did it!</h2>
            <p className="text-primary font-bold mt-1">{deal.item_name}</p>
            <p className="text-success text-sm mt-2">Fully earned!</p>
          </MobileCard>
        </motion.div>
      );
    }

    // No deal: request form
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h2 className="font-display font-bold text-2xl">Make a Deal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Want something? Ask your parent to front the cost. Then earn it
            back through missions.
          </p>
        </div>

        <MobileInput
          label="What do you want?"
          placeholder="e.g. Basketball shoes"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <MobileInput
          label="Why do you want it?"
          placeholder="Tell your parent why this matters to you"
          value={kidNote}
          onChange={(e) => setKidNote(e.target.value)}
        />

        <MobileButton
          variant="primary"
          fullWidth
          disabled={!itemName.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Send Request to Parent"
          )}
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

      <KidBottomNav activeTab={activeTab} />
    </div>
  );
};

export default KidDeals;
