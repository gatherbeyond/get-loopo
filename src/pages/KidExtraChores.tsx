import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Coins,
  ChevronRight,
  ShoppingBag,
  Home,
  PawPrint,
  UtensilsCrossed,
  Leaf,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  MobileCard,
  MobileButton,
  ProgressBar,
  EmptyState,
  MobileInput,
} from "@/components/mobile";
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
import { cn } from "@/lib/utils";

interface ChoreTemplate {
  id: string;
  title: string;
  category: string;
  credits: number;
  estimated_time: string;
  description: string;
  supervised_only: boolean;
}

const CATEGORIES = [
  { id: "All", label: "All", icon: ShoppingBag },
  { id: "Home", label: "Home", icon: Home },
  { id: "Pet Care", label: "Pet Care", icon: PawPrint },
  { id: "Kitchen", label: "Kitchen", icon: UtensilsCrossed },
  { id: "Environment", label: "Environment", icon: Leaf },
] as const;

const KidExtraChores: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState<ChoreTemplate[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [familyId, setFamilyId] = React.useState<string | null>(null);

  const [selected, setSelected] = React.useState<ChoreTemplate | null>(null);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        if (user?.kidId) {
          const { data: kid } = await supabase
            .from("kids")
            .select("family_id")
            .eq("id", user.kidId)
            .maybeSingle();
          if (kid) setFamilyId(kid.family_id);
        }

        const { data, error } = await supabase
          .from("extra_chore_templates")
          .select("*")
          .order("credits", { ascending: true });
        if (error) throw error;
        setTemplates((data ?? []) as ChoreTemplate[]);
      } catch (err) {
        console.error(err);
        toast({
          title: "Couldn't load chores",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.kidId, toast]);

  const filtered = React.useMemo(() => {
    if (activeCategory === "All") return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const openRequest = (t: ChoreTemplate) => {
    setSelected(t);
    setNote("");
  };

  const closeSheet = () => {
    if (submitting) return;
    setSelected(null);
    setNote("");
  };

  const sendRequest = async () => {
    if (!selected || !user?.kidId || !familyId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("extra_chore_requests").insert({
        kid_id: user.kidId,
        family_id: familyId,
        template_id: selected.id,
        title: selected.title,
        credits: selected.credits,
        category: selected.category,
        estimated_time: selected.estimated_time,
        kid_note: note.trim() || null,
        status: "requested",
        last_requested_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Request sent to your parent!" });
      setSelected(null);
      setNote("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't send request",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/kid/missions")}
            className="touch-target flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-kid-header text-foreground leading-tight">
              Extra Chores
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Earn more credits
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full font-body font-semibold text-sm transition-all touch-target",
                    active
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No chores here yet"
            description="Try a different category to find ways to earn more credits."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-card rounded-2xl p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                          {t.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="font-body text-sm">
                            {t.estimated_time}
                          </span>
                        </div>
                        {t.description && (
                          <p className="font-body text-sm text-muted-foreground line-clamp-2 mt-2">
                            {t.description}
                          </p>
                        )}
                        {t.supervised_only && (
                          <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs font-body font-semibold">
                              Needs supervision
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-3 text-accent-gold">
                          <Coins className="w-5 h-5" />
                          <span className="font-display font-bold text-lg">
                            {t.credits}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <MobileButton
                          variant="primary"
                          size="sm"
                          onClick={() => openRequest(t)}
                        >
                          Request
                          <ChevronRight className="w-4 h-4" />
                        </MobileButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Confirmation Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t-0 p-6 max-h-[90vh] overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display font-bold text-2xl text-foreground text-left">
                  {selected.title}
                </SheetTitle>
              </SheetHeader>

              <div className="flex items-center gap-2 mt-2 text-accent-gold">
                <Coins className="w-5 h-5" />
                <span className="font-display font-bold text-lg">
                  {selected.credits} credits
                </span>
              </div>

              <div className="mt-6">
                <MobileInput
                  label="Note for your parent"
                  placeholder="Add a note for your parent (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="mt-6 space-y-3">
                <MobileButton
                  variant="primary"
                  fullWidth
                  onClick={sendRequest}
                  disabled={submitting || !familyId}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
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
            </>
          )}
        </SheetContent>
      </Sheet>

      <KidBottomNav
        activeTab="missions"
        onTabChange={(tab) => {
          if (tab === "home") navigate("/kid");
          else if (tab === "missions") navigate("/kid/missions");
          else if (tab === "shop") navigate("/kid/marketplace");
          else if (tab === "rewards") navigate("/kid/rewards");
        }}
      />
    </div>
  );
};

export default KidExtraChores;
