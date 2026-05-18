import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Handshake,
  Coins,
  Check,
  X,
  Loader2,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { MobileCard, MobileButton, ProgressBar } from "@/components/mobile";
import { MobileInput } from "@/components/mobile/MobileInput";
import { EmptyState } from "@/components/mobile/EmptyState";
import { ParentTopBar, ParentBottomNav } from "@/components/parent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";

interface DealRequest {
  id: string;
  kid_id: string;
  kid_name: string;
  kid_avatar: string;
  item_name: string;
  kid_note?: string;
  parent_note?: string;
  credits_goal: number | null;
  credits_paid: number;
  real_cost: number | null;
  status: string;
  created_at: string;
}

const ParentDeals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<DealRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<DealRequest | null>(null);
  const [creditsGoal, setCreditsGoal] = useState("");
  const [realCost, setRealCost] = useState("");
  const [parentNote, setParentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [familyName, setFamilyName] = useState("Deals");
  const [parentInitial, setParentInitial] = useState("D");

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: family } = await supabase
        .from("families")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();
      if (!family) {
        setDeals([]);
        return;
      }

      const { data, error } = await supabase
        .from("parent_deals")
        .select("*, kids:kid_id(name, avatar)")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const mapped: DealRequest[] = (data ?? []).map((d: any) => ({
        id: d.id,
        kid_id: d.kid_id,
        kid_name: d.kids?.name ?? "Kid",
        kid_avatar: d.kids?.avatar ?? "",
        item_name: d.item_name,
        kid_note: d.kid_note ?? undefined,
        parent_note: d.parent_note ?? undefined,
        credits_goal: d.credits_goal,
        credits_paid: d.credits_paid ?? 0,
        real_cost: d.real_cost,
        status: d.status,
        created_at: d.created_at,
      }));
      setDeals(mapped);
    } catch (err) {
      toast({
        title: "Could not load deals",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    const fetchParent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) {
        setParentInitial(profile.full_name.charAt(0).toUpperCase());
      }
      const { data: family } = await supabase
        .from("families")
        .select("family_name")
        .eq("parent_id", user.id)
        .maybeSingle();
      if (family?.family_name) setFamilyName(family.family_name);
    };
    fetchParent();
  }, []);

  const openSetTerms = (deal: DealRequest) => {
    setActiveRequest(deal);
    setCreditsGoal("");
    setRealCost("");
    setParentNote("");
  };

  const closeSheet = () => setActiveRequest(null);

  const handleApprove = async () => {
    if (!activeRequest || !creditsGoal) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("parent_deals")
        .update({
          status: "active",
          credits_goal: parseInt(creditsGoal, 10),
          real_cost: realCost ? parseFloat(realCost) : null,
          parent_note: parentNote.trim() || null,
        })
        .eq("id", activeRequest.id);
      if (error) throw error;
      toast({ title: `${activeRequest.kid_name}'s deal is active!` });
      closeSheet();
      await fetchDeals();
    } catch (err) {
      toast({
        title: "Could not approve deal",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (deal: DealRequest) => {
    try {
      const { error } = await supabase
        .from("parent_deals")
        .update({ status: "completed" })
        .eq("id", deal.id);
      if (error) throw error;
      toast({ title: "Deal marked complete" });
      await fetchDeals();
    } catch (err) {
      toast({
        title: "Could not mark complete",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const requested = deals.filter((d) => d.status === "requested");
  const active = deals.filter((d) => d.status === "active");
  const completed = deals.filter((d) => d.status === "completed");

  const KidAvatar = ({ avatar, name }: { avatar: string; name: string }) => (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
      {resolveAvatar(avatar) || name.charAt(0)}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <ParentTopBar familyName={familyName} initial={parentInitial} />

      <main className="px-4 pt-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : deals.length === 0 ? (
          <EmptyState
            title="No deal requests yet"
            description="Your kids can request deals from their Rewards tab"
          />
        ) : (
          <>
            {requested.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display font-bold text-base text-foreground px-1">
                  Needs Your Response
                </h2>
                <AnimatePresence>
                  {requested.map((deal) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <MobileCard variant="default" padding="default">
                        <div className="flex items-start gap-3">
                          <KidAvatar
                            avatar={deal.kid_avatar}
                            name={deal.kid_name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-body font-semibold text-foreground">
                                {deal.kid_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(deal.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
                              DEAL REQUEST
                            </span>
                            <h3 className="font-display font-bold text-xl text-foreground mt-2">
                              {deal.item_name}
                            </h3>
                            {deal.kid_note && (
                              <p className="italic text-sm text-muted-foreground mt-1">
                                "{deal.kid_note}"
                              </p>
                            )}
                            <div className="mt-3">
                              <MobileButton
                                variant="primary"
                                size="sm"
                                onClick={() => openSetTerms(deal)}
                              >
                                <Handshake className="w-4 h-4 mr-1" />
                                Set Terms
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </MobileButton>
                            </div>
                          </div>
                        </div>
                      </MobileCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </section>
            )}

            {active.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display font-bold text-base text-foreground px-1">
                  Active Deals
                </h2>
                {active.map((deal) => {
                  const goal = deal.credits_goal ?? 0;
                  const ready = goal > 0 && deal.credits_paid >= goal;
                  return (
                    <MobileCard
                      key={deal.id}
                      variant="default"
                      padding="default"
                    >
                      <div className="flex items-start gap-3">
                        <KidAvatar
                          avatar={deal.kid_avatar}
                          name={deal.kid_name}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-body font-semibold text-foreground">
                              {deal.kid_name}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-foreground mt-1">
                            {deal.item_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Coins className="w-4 h-4 text-accent-gold" />
                            <span className="font-display font-bold">
                              {deal.credits_paid} / {goal}
                            </span>
                          </div>
                          <div className="mt-2">
                            <ProgressBar
                              variant="gold"
                              size="sm"
                              value={deal.credits_paid}
                              max={goal || 1}
                            />
                          </div>
                          {ready && (
                            <div className="mt-3">
                              <MobileButton
                                variant="success"
                                size="sm"
                                onClick={() => handleMarkComplete(deal)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Mark Complete
                              </MobileButton>
                            </div>
                          )}
                        </div>
                      </div>
                    </MobileCard>
                  );
                })}
              </section>
            )}

            {completed.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display font-bold text-base text-foreground px-1">
                  Completed
                </h2>
                {completed.map((deal) => (
                  <MobileCard
                    key={deal.id}
                    variant="default"
                    padding="default"
                    className="opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-foreground truncate">
                          {deal.item_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deal.kid_name}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold">
                        Completed
                      </span>
                    </div>
                  </MobileCard>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <ParentBottomNav activeTab="tasks" />

      <Sheet
        open={!!activeRequest}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[90vh] overflow-y-auto"
        >
          {activeRequest && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display font-bold text-xl text-left">
                  {activeRequest.kid_name} wants {activeRequest.item_name}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 pt-4">
                {activeRequest.kid_note && (
                  <p className="italic text-sm text-muted-foreground">
                    "{activeRequest.kid_note}"
                  </p>
                )}

                <div>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-2">Quick presets</p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {[1000, 2000, 3000, 5000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setCreditsGoal(String(preset))}
                        className={`px-3 py-1.5 rounded-full border font-body text-sm font-semibold transition-colors ${
                          creditsGoal === String(preset)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary"
                        }`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <MobileInput
                  type="number"
                  label="Credits kid must earn"
                  placeholder="e.g. 5000"
                  value={creditsGoal}
                  onChange={(e) => setCreditsGoal(e.target.value)}
                />

                {creditsGoal && Number(creditsGoal) > 0 && (
                  <p className="font-body text-xs text-muted-foreground -mt-2">
                    ≈ {Math.ceil(Number(creditsGoal) / 400)} missions at 400 credits each
                  </p>
                )}

                <MobileInput
                  type="number"
                  label="Real cost (optional)"
                  placeholder="e.g. 500"
                  value={realCost}
                  onChange={(e) => setRealCost(e.target.value)}
                />

                <MobileInput
                  label="Note for kid (optional)"
                  placeholder="e.g. I got you the shoes, now earn them back!"
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                />

                <MobileButton
                  variant="primary"
                  fullWidth
                  disabled={!creditsGoal || submitting}
                  onClick={handleApprove}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Approve Deal
                    </>
                  )}
                </MobileButton>

                <button
                  onClick={closeSheet}
                  className="w-full text-center text-sm text-muted-foreground py-2 flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ParentDeals;
