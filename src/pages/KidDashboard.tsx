import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import loopoPoint2 from "@/assets/loopo-point-2.png";
import loopoCelebrate from "@/assets/loopo-celebrate.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  KidTopBar,
  KidCreditHero,
  MissionCarousel,
  Mission,
  KidBottomNav,
  KidNavTab,
} from "@/components/kid";
import { CoinIcon, MobileButton } from "@/components/mobile";
import { WishlistDashboardPreview } from "@/components/kid/WishlistDashboardPreview";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const mapStatus = (dbStatus: string): Mission["status"] => {
  switch (dbStatus) {
    case "in_progress": return "in_progress";
    case "pending": return "pending_approval";
    case "denied": return "not_started";
    default: return "not_started";
  }
};

const KidDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("home");
  const [credits, setCredits] = React.useState(0);
  const [missions, setMissions] = React.useState<Mission[]>([]);
  const [wishlistItems, setWishlistItems] = React.useState<
    { id: string; title: string; credits_goal: number }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [showTour, setShowTour] = React.useState(false);
  const [celebrationTask, setCelebrationTask] = React.useState<{
    id: string;
    title: string;
    credits: number;
  } | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user?.kidId) return;
    const key = `loopo_tour_seen_${user.kidId}`;
    if (!localStorage.getItem(key)) {
      setShowTour(true);
    }
  }, [user?.kidId]);

  const fetchData = React.useCallback(async () => {
    if (!user?.kidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tasksRes, creditsRes, wishlistRes, celebrationRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("kid_id", user.kidId)
          .neq("status", "completed"),
        supabase
          .from("kids")
          .select("credits_balance")
          .eq("id", user.kidId)
          .maybeSingle(),
        supabase
          .from("kid_wishlist_items")
          .select("id, title, credits_goal")
          .eq("kid_id", user.kidId)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("tasks")
          .select("id, title, credits_reward")
          .eq("kid_id", user.kidId)
          .eq("status", "completed")
          .eq("celebration_seen", false)
          .order("completed_at", { ascending: false })
          .limit(1),
      ]);

      if (tasksRes.data) {
        setMissions(
          tasksRes.data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            creditReward: t.credits_reward,
            status: mapStatus(t.status),
            photoRequired: t.photo_required ?? false,
          }))
        );
      }
      if (creditsRes.data) {
        setCredits(creditsRes.data.credits_balance ?? 0);
      }
      if (wishlistRes.data) {
        setWishlistItems(wishlistRes.data);
      }
      if (celebrationRes.data?.[0]) {
        setCelebrationTask({
          id: celebrationRes.data[0].id,
          title: celebrationRes.data[0].title,
          credits: celebrationRes.data[0].credits_reward,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.kidId]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchData]);

  React.useEffect(() => {
    if (!user?.kidId) return;

    const channel = supabase
      .channel(`task-approvals-${user.kidId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `kid_id=eq.${user.kidId}`,
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            title: string;
            credits_reward: number;
            status: string;
            celebration_seen: boolean;
          };
          if (updated.status === "completed" && !updated.celebration_seen) {
            setCelebrationTask({
              id: updated.id,
              title: updated.title,
              credits: updated.credits_reward,
            });
            void fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.kidId, fetchData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMissionAction = async (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    if (mission.status === "not_started") {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", missionId);
      if (!error) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId ? { ...m, status: "in_progress" as const } : m
          )
        );
        toast({ title: "Mission Started! 🚀", description: `You started "${mission.title}"` });
      }
    } else if (mission.status === "in_progress") {
      if (mission.photoRequired) {
        navigate(`/kid/mission/${missionId}`);
        return;
      }
      const { error } = await supabase
        .from("tasks")
        .update({ status: "pending", submitted_at: new Date().toISOString() })
        .eq("id", missionId);
      if (!error) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId ? { ...m, status: "pending_approval" as const } : m
          )
        );
        toast({ title: "Waiting for approval! ⏳", description: "Your parent will review your work" });
      }
    }
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "missions") navigate("/kid/missions");
    else if (tab === "shop") navigate("/kid/shop");
    else if (tab === "rewards") navigate("/kid/rewards");
  };

  const dismissTour = () => {
    if (!user?.kidId) return;
    localStorage.setItem(`loopo_tour_seen_${user.kidId}`, "1");
    setShowTour(false);
  };

  const dismissCelebration = React.useCallback(async () => {
    if (!celebrationTask) return;
    const taskId = celebrationTask.id;
    setCelebrationTask(null);
    const { error } = await supabase.rpc("mark_celebration_seen", {
      task_id: taskId,
    });
    if (error) console.error("mark_celebration_seen failed", error);
  }, [celebrationTask]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <KidTopBar kidName={user?.name || "Kid"} onLogout={handleLogout} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {loading ? (
          <div className="px-5 mt-4 space-y-4">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-56 w-[280px] rounded-[20px]" />
              <Skeleton className="h-56 w-[280px] rounded-[20px]" />
            </div>
          </div>
        ) : (
          <>
            <KidCreditHero credits={credits} className="mt-2" />
            <MissionCarousel
              missions={missions}
              onMissionAction={handleMissionAction}
              onSeeAll={() => navigate("/kid/missions")}
            />
            <WishlistDashboardPreview
              items={wishlistItems}
              credits={credits}
              onSeeAll={() => navigate("/kid/wishlist")}
              onAdd={() => navigate("/kid/wishlist")}
            />
          </>
        )}
        <div className="h-8" />
      </motion.main>

      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="fixed bottom-24 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <button
          onClick={() => navigate("/kid-login?step=profile")}
          className="pointer-events-auto font-body text-xs text-muted-foreground/60 underline underline-offset-2"
        >
          Not {user?.name || "you"}?
        </button>
      </div>

      <AnimatePresence>
        {celebrationTask && (
          <motion.div
            key="celebration-overlay"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-primary/95 via-primary to-primary-hover/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const colors = [
                "hsl(var(--accent-gold))",
                "hsl(var(--secondary))",
                "hsl(var(--success))",
                "hsl(var(--primary-foreground))",
              ];
              const color = colors[i % colors.length];
              const left = (i * 37) % 100;
              const delay = (i % 8) * 0.15;
              const size = 8 + (i % 4) * 4;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    left: `${left}%`,
                    top: "-5%",
                    width: size,
                    height: size,
                    backgroundColor: color,
                  }}
                  initial={{ y: -40, opacity: 0, rotate: 0 }}
                  animate={{
                    y: "110vh",
                    opacity: [0, 1, 1, 0],
                    rotate: 720,
                  }}
                  transition={{
                    duration: 3 + (i % 3),
                    delay,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                />
              );
            })}

            <motion.div
              className="relative z-10 flex flex-col items-center text-center max-w-xs"
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
            >
              <motion.img
                src={loopoCelebrate}
                alt="Loopo celebrating"
                className="h-40 w-auto object-contain mb-4 drop-shadow-2xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />

              <h2 className="font-display font-bold text-2xl text-primary-foreground mb-2">
                {celebrationTask.title}
              </h2>

              <div className="flex items-center justify-center gap-2 mb-1">
                <CoinIcon className="h-8 w-8" />
                <span className="font-display font-bold text-4xl text-accent-gold">
                  +{celebrationTask.credits.toLocaleString()}
                </span>
              </div>
              <p className="font-body text-lg text-primary-foreground/90 mb-6">
                credits earned!
              </p>

              <div className="bg-primary-foreground/10 rounded-2xl px-5 py-4 mb-6 border border-primary-foreground/20">
                <p className="font-display font-bold text-lg text-primary-foreground mb-1">
                  Your parent approved it!
                </p>
                <p className="font-body text-sm text-primary-foreground/80">
                  Keep going — more missions await!
                </p>
              </div>

              <MobileButton
                variant="gold"
                fullWidth
                onClick={dismissCelebration}
              >
                Keep earning!
              </MobileButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTour && (
          <motion.div
            key="tour-overlay"
            className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm flex flex-col items-center justify-center px-6 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissTour}
          >
            <motion.div
              className="bg-gradient-gold rounded-3xl shadow-gold px-6 py-5 max-w-xs text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <p className="font-display font-bold text-xl text-foreground">
                Tap any mission to play!
              </p>
            </motion.div>

            <motion.div
              className="absolute bottom-32 right-6 flex flex-col items-center gap-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <motion.img
                src={loopoPoint2}
                alt="Loopo"
                className="h-24 w-auto object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <p className="font-display text-sm text-primary-foreground bg-primary/80 rounded-full px-3 py-1">
                Tap anywhere!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidDashboard;
