import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Target, Trash2, Check, Loader2 } from "lucide-react";
import { MobileButton, MobileInput } from "@/components/mobile";
import { KidBottomNav } from "@/components/kid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import loopoMascot from "@/assets/loopo-mascot.png";

interface WishlistItem {
  id: string;
  title: string;
  credits_goal: number;
  created_at: string;
}

const MAX_TITLE = 60;

const KidWishlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [credits, setCredits] = React.useState(0);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!user?.kidId) {
      setLoading(false);
      return;
    }
    try {
      const [itemsRes, kidRes] = await Promise.all([
        supabase
          .from("kid_wishlist_items")
          .select("id, title, credits_goal, created_at")
          .eq("kid_id", user.kidId)
          .order("created_at", { ascending: false }),
        supabase
          .from("kids")
          .select("credits_balance")
          .eq("id", user.kidId)
          .maybeSingle(),
      ]);
      if (itemsRes.data) setItems(itemsRes.data as WishlistItem[]);
      if (kidRes.data) setCredits(kidRes.data.credits_balance ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.kidId]);

  React.useEffect(() => {
    void fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") void fetchData();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchData]);

  const openSheet = () => {
    setTitle("");
    setGoal("");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    if (submitting) return;
    setSheetOpen(false);
  };

  const goalNumber = Number.parseInt(goal, 10);
  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE &&
    Number.isFinite(goalNumber) &&
    goalNumber > 0;

  const submit = async () => {
    if (!canSubmit || !user?.kidId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("kid_wishlist_items").insert({
        kid_id: user.kidId,
        title: title.trim(),
        credits_goal: goalNumber,
      });
      if (error) throw error;
      toast({ title: "Added to your wishlist" });
      setSheetOpen(false);
      setTitle("");
      setGoal("");
      await fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't add item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("kid_wishlist_items")
        .delete()
        .eq("id", confirmDeleteId);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== confirmDeleteId));
      toast({ title: "Removed from wishlist" });
      setConfirmDeleteId(null);
      setExpandedId(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't remove item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteTarget = items.find((i) => i.id === confirmDeleteId);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/kid")}
            className="touch-target flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-kid-header text-foreground leading-tight">
              My Wishlist
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Things you're saving up for
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <img
              src={loopoMascot}
              alt="Loopo mascot"
              className="w-40 h-40 object-contain mb-4"
            />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Nothing yet!
            </h2>
            <p className="font-body text-base text-muted-foreground mb-6">
              What are you saving up for?
            </p>
            <MobileButton variant="primary" onClick={openSheet}>
              <Plus className="w-5 h-5" />
              Add Your First Item
            </MobileButton>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const pct = Math.min(
                  100,
                  Math.round((credits / item.credits_goal) * 100)
                );
                const ready = credits >= item.credits_goal;
                const expanded = expandedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((cur) => (cur === item.id ? null : item.id))
                      }
                      className="w-full text-left bg-card rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Target className="w-6 h-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-foreground text-lg leading-tight truncate">
                              {item.title}
                            </h3>
                            {ready ? (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 text-success font-display font-bold text-xs whitespace-nowrap">
                                <Check className="w-3.5 h-3.5" />
                                Ready!
                              </span>
                            ) : (
                              <span className="font-display font-bold text-sm text-primary whitespace-nowrap">
                                {pct}%
                              </span>
                            )}
                          </div>

                          <p className="font-body text-xs text-muted-foreground mt-1">
                            {credits.toLocaleString()} / {item.credits_goal.toLocaleString()} credits
                          </p>

                          <div className="mt-2 w-full h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className={
                                ready
                                  ? "h-full bg-gradient-gold rounded-full"
                                  : "h-full bg-gradient-primary rounded-full"
                              }
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>

                          {ready && (
                            <p className="font-body text-xs text-muted-foreground mt-2">
                              You have enough to redeem from Marketplace or ask for a Deal
                            </p>
                          )}

                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 mt-3 border-t border-border flex justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(item.id);
                                    }}
                                    className="touch-target inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-error/10 text-error font-body font-semibold text-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      {!loading && items.length > 0 && (
        <button
          onClick={openSheet}
          aria-label="Add wishlist item"
          className="fixed right-5 z-40 w-14 h-14 rounded-full bg-gradient-primary text-primary-foreground shadow-button flex items-center justify-center active:scale-95 transition-transform touch-target"
          style={{
            bottom: "calc(76px + max(env(safe-area-inset-bottom), 8px))",
          }}
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Add sheet */}
      <Sheet open={sheetOpen} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t-0 p-6 max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-bold text-2xl text-foreground text-left">
              Add to Wishlist
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <MobileInput
                label="What do you want?"
                placeholder="e.g. New skateboard"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                maxLength={MAX_TITLE}
              />
              <p className="mt-1 text-right font-body text-xs text-muted-foreground">
                {title.length}/{MAX_TITLE}
              </p>
            </div>

            <MobileInput
              label="Credits goal"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="5000"
              value={goal}
              onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="mt-6 space-y-3">
            <MobileButton
              variant="primary"
              fullWidth
              onClick={submit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Wishlist"
              )}
            </MobileButton>
            <button
              onClick={closeSheet}
              disabled={submitting}
              className="w-full text-center font-body font-semibold text-muted-foreground py-2 touch-target"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDeleteId && deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDeleteId(null)}
              className="fixed inset-0 bg-foreground/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl p-6 w-[calc(100%-48px)] max-w-sm shadow-xl"
            >
              <h3 className="font-display font-bold text-xl text-foreground text-center mb-2">
                Remove from wishlist?
              </h3>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                This will remove {deleteTarget.title} from your wishlist.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl bg-error text-error-foreground font-display font-bold text-sm inline-flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

export default KidWishlist;
