import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Coins,
  Target,
  Loader2,
  CheckCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { MobileCard, MobileButton, ProgressBar, EmptyState } from "@/components/mobile";
import { MobileInput } from "@/components/mobile/MobileInput";
import { ParentTopBar, ParentBottomNav } from "@/components/parent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolveAvatar } from "@/lib/avatars";

interface ParentDeal {
  id: string;
  kid_id: string;
  kid_name: string;
  kid_avatar: string;
  item_name: string;
  real_cost: number;
  credits_goal: number;
  credits_paid: number;
  status: string;
  parent_note?: string;
  created_at: string;
}

interface Kid {
  id: string;
  name: string;
  avatar: string;
}

const ParentDeals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [deals, setDeals] = useState<ParentDeal[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [formKidId, setFormKidId] = useState("");
  const [formItemName, setFormItemName] = useState("");
  const [formRealCost, setFormRealCost] = useState("");
  const [formCreditsGoal, setFormCreditsGoal] = useState("");
  const [formNote, setFormNote] = useState("");

  const resetForm = () => {
    setFormKidId("");
    setFormItemName("");
    setFormRealCost("");
    setFormCreditsGoal("");
    setFormNote("");
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: family } = await supabase
        .from("families")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();

      if (!family) {
        setLoading(false);
        return;
      }
      setFamilyId(family.id);

      const { data: kidsData } = await supabase
        .from("kids")
        .select("id, name, avatar")
        .eq("family_id", family.id)
        .order("name");

      const kidsList: Kid[] = kidsData || [];
      setKids(kidsList);

      const { data: dealsData } = await supabase
        .from("parent_deals")
        .select("id, kid_id, item_name, real_cost, credits_goal, credits_paid, status, parent_note, created_at")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false });

      const kidsMap = new Map(kidsList.map((k) => [k.id, k]));
      const enriched: ParentDeal[] = (dealsData || []).map((d) => {
        const kid = kidsMap.get(d.kid_id);
        return {
          id: d.id,
          kid_id: d.kid_id,
          kid_name: kid?.name || "Unknown",
          kid_avatar: kid?.avatar || "",
          item_name: d.item_name,
          real_cost: Number(d.real_cost),
          credits_goal: d.credits_goal,
          credits_paid: d.credits_paid,
          status: d.status,
          parent_note: d.parent_note ?? undefined,
          created_at: d.created_at,
        };
      });
      setDeals(enriched);
    } catch (err) {
      console.error("Failed to load deals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDeal = async () => {
    if (!familyId) return;
    if (!formKidId || !formItemName.trim() || !formRealCost || !formCreditsGoal) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const realCostNum = parseFloat(formRealCost);
    const goalNum = parseInt(formCreditsGoal, 10);
    if (isNaN(realCostNum) || realCostNum <= 0 || isNaN(goalNum) || goalNum <= 0) {
      toast({
        title: "Invalid values",
        description: "Cost and credits goal must be positive numbers.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("parent_deals").insert({
        family_id: familyId,
        kid_id: formKidId,
        item_name: formItemName.trim(),
        real_cost: realCostNum,
        credits_goal: goalNum,
        credits_paid: 0,
        status: "active",
        parent_note: formNote.trim() || null,
      });

      if (error) throw error;

      toast({ title: "Deal created" });
      resetForm();
      setSheetOpen(false);
      await loadData();
    } catch (err: any) {
      toast({
        title: "Could not create deal",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from("parent_deals")
        .update({ status: "completed" })
        .eq("id", dealId);
      if (error) throw error;
      toast({ title: "Deal marked complete" });
      await loadData();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const activeDeals = deals.filter((d) => d.status === "active");
  const completedDeals = deals.filter((d) => d.status === "completed");
  const otherDeals = deals.filter(
    (d) => d.status !== "active" && d.status !== "completed"
  );
  const orderedDeals = [...activeDeals, ...completedDeals, ...otherDeals];

  const renderStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: {
        label: "Active",
        className: "bg-primary/10 text-primary",
      },
      completed: {
        label: "Completed",
        className: "bg-success/15 text-success",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-muted text-muted-foreground",
      },
    };
    const conf = map[status] ?? {
      label: status,
      className: "bg-muted text-muted-foreground",
    };
    return (
      <span
        className={`text-xs font-display font-bold px-2.5 py-1 rounded-full ${conf.className}`}
      >
        {conf.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <ParentTopBar familyName="Deals" />

      {/* Sticky sub-header */}
      <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MobileButton
            variant="primary"
            size="sm"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Deal
          </MobileButton>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : orderedDeals.length === 0 ? (
          <EmptyState
            title="No deals yet"
            description="Create a deal to help your kid earn something special"
            actionLabel="New Deal"
            onAction={() => setSheetOpen(true)}
          />
        ) : (
          <AnimatePresence initial={false}>
            {orderedDeals.map((deal) => {
              const pct = Math.min(
                100,
                Math.round((deal.credits_paid / Math.max(1, deal.credits_goal)) * 100)
              );
              const isCompleted = deal.status === "completed";
              return (
                <motion.div
                  key={deal.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <MobileCard variant="default" interactive={false} padding="default">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                            {resolveAvatar(deal.kid_avatar)}
                          </div>
                          <div className="font-display font-bold text-foreground truncate">
                            {deal.kid_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          {renderStatusBadge(deal.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary shrink-0" />
                        <h3 className="text-lg font-display font-bold text-foreground truncate">
                          {deal.item_name}
                        </h3>
                      </div>

                      <ProgressBar
                        variant="gold"
                        size="default"
                        showPercentage
                        value={deal.credits_paid}
                        max={deal.credits_goal}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Coins className="w-4 h-4 text-accent-gold" />
                          <span>
                            {deal.credits_paid.toLocaleString()} /{" "}
                            {deal.credits_goal.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {pct}%
                        </div>
                      </div>

                      {deal.parent_note && (
                        <p className="text-sm text-muted-foreground italic">
                          {deal.parent_note}
                        </p>
                      )}

                      {deal.status === "active" && (
                        <div className="flex justify-end">
                          <MobileButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkComplete(deal.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                            <ChevronRight className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      )}
                    </div>
                  </MobileCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      {/* New Deal Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display">New Deal</SheetTitle>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </SheetHeader>

          <div className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <label className="text-sm font-display font-bold text-foreground">
                Kid
              </label>
              <select
                value={formKidId}
                onChange={(e) => setFormKidId(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border-2 border-border bg-background text-foreground font-medium focus:outline-none focus:border-primary"
              >
                <option value="">Select a kid…</option>
                {kids.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            <MobileInput
              label="Item name"
              placeholder="e.g. New headphones"
              value={formItemName}
              onChange={(e) => setFormItemName(e.target.value)}
            />

            <MobileInput
              label="Real cost (in your currency)"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 500"
              value={formRealCost}
              onChange={(e) => setFormRealCost(e.target.value)}
            />

            <MobileInput
              label="Credits kid must earn"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 5000"
              value={formCreditsGoal}
              onChange={(e) => setFormCreditsGoal(e.target.value)}
            />

            <MobileInput
              label="Note"
              placeholder="Add a note (optional)"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
            />

            <MobileButton
              variant="primary"
              fullWidth
              onClick={handleCreateDeal}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Deal
                </>
              )}
            </MobileButton>
          </div>
        </SheetContent>
      </Sheet>

      <ParentBottomNav activeTab="tasks" />
    </div>
  );
};

export default ParentDeals;
