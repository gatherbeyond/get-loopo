import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  KidBottomNav,
  KidNavTab,
  MissionStatus,
} from "@/components/kid";
import { MobileButton } from "@/components/mobile";
import { EmptyState } from "@/components/mobile/EmptyState";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  description: string;
  creditReward: number;
  status: MissionStatus;
}

const mapStatus = (dbStatus: string): MissionStatus => {
  switch (dbStatus) {
    case "in_progress": return "in_progress";
    case "pending": return "pending_approval";
    case "completed": return "completed";
    case "denied": return "needs_work" as MissionStatus;
    default: return "not_started";
  }
};

type ExtendedStatus = MissionStatus | "needs_work";
type FilterTab = "all" | ExtendedStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Missions" },
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "needs_work", label: "Needs Work" },
  { id: "pending_approval", label: "Waiting Approval" },
  { id: "completed", label: "Completed" },
];

const statusConfig: Record<ExtendedStatus, { label: string; bgClass: string; textClass: string }> = {
  not_started: { label: "Not Started", bgClass: "bg-muted", textClass: "text-muted-foreground" },
  in_progress: { label: "In Progress", bgClass: "bg-primary", textClass: "text-primary-foreground" },
  needs_work: { label: "Try Again", bgClass: "bg-warning/20", textClass: "text-warning" },
  pending_approval: { label: "Pending", bgClass: "bg-accent-gold", textClass: "text-accent-gold-foreground" },
  completed: { label: "Completed", bgClass: "bg-success", textClass: "text-success-foreground" },
};

const actionConfig: Record<ExtendedStatus, { label: string; variant: "primary" | "ghost"; disabled: boolean }> = {
  not_started: { label: "Start Mission", variant: "primary", disabled: false },
  in_progress: { label: "Mark Complete", variant: "primary", disabled: false },
  needs_work: { label: "See Feedback", variant: "primary", disabled: false },
  pending_approval: { label: "Waiting...", variant: "ghost", disabled: true },
  completed: { label: "Done", variant: "ghost", disabled: true },
};

const KidMissions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("all");
  const [missions, setMissions] = React.useState<Mission[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    if (!user?.kidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("kid_id", user.kidId);

      if (data) {
        setMissions(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            creditReward: t.credits_reward,
            status: mapStatus(t.status),
          }))
        );
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

  const filteredMissions = activeFilter === "all"
    ? missions
    : missions.filter((m) => m.status === activeFilter);

  const handleMissionAction = async (missionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    if ((mission.status as ExtendedStatus) === "needs_work") {
      navigate(`/kid/mission/${missionId}`);
      return;
    }

    if (mission.status === "not_started") {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", missionId);
      if (!error) {
        setMissions((prev) =>
          prev.map((m) => m.id === missionId ? { ...m, status: "in_progress" as const } : m)
        );
        toast({ title: "Mission Started! 🚀", description: `You started "${mission.title}"` });
      }
    } else if (mission.status === "in_progress") {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "pending", submitted_at: new Date().toISOString() })
        .eq("id", missionId);
      if (!error) {
        setMissions((prev) =>
          prev.map((m) => m.id === missionId ? { ...m, status: "pending_approval" as const } : m)
        );
        toast({ title: "Waiting for approval! ⏳", description: "Your parent will review your work" });
      }
    }
  };

  const handleTabChange = (tab: KidNavTab) => {
    if (tab === "home") navigate("/kid");
    if (tab === "shop") navigate("/kid/shop");
    if (tab === "rewards") navigate("/kid/rewards");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background pt-safe-top">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button
            onClick={() => navigate("/kid")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">My Missions</h1>
            <p className="font-body text-sm text-muted-foreground">Complete tasks to earn credits!</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-body font-semibold transition-all",
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extra Chores CTA */}
      <div className="px-5 mt-4">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground">
              Want to earn more?
            </h3>
            <p className="text-sm font-body text-muted-foreground">
              Request extra chores
            </p>
          </div>
          <MobileButton
            variant="outline"
            size="sm"
            onClick={() => navigate("/kid/extra-chores")}
          >
            Browse
          </MobileButton>
        </div>
      </div>

      {/* Mission List */}
      <motion.div
        className="px-5 mt-2 flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredMissions.length === 0 ? (
              <EmptyState
                key="empty"
                title="No missions here yet!"
                description={
                  missions.length === 0
                    ? "Ask your parent to create missions for you!"
                    : "Check another tab for your missions."
                }
              />
            ) : (
              filteredMissions.map((mission, i) => {
                const status = statusConfig[mission.status];
                const action = actionConfig[mission.status];
                return (
                  <motion.div
                    key={mission.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="bg-card rounded-2xl p-4 shadow-card cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate(`/kid/mission/${mission.id}`)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-display font-bold text-lg text-foreground flex-1 mr-2">
                        {mission.title}
                      </h3>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-body font-semibold flex-shrink-0", status.bgClass, status.textClass)}>
                        {status.label}
                      </span>
                    </div>

                    <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
                      {mission.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                          <Coins className="w-3.5 h-3.5 text-foreground" />
                        </div>
                        <span className="font-display font-bold text-lg text-accent-gold">
                          {mission.creditReward.toLocaleString()}
                        </span>
                      </div>
                      <MobileButton
                        variant={action.variant}
                        size="sm"
                        disabled={action.disabled}
                        onClick={(e) => handleMissionAction(mission.id, e)}
                        className="h-9 text-sm"
                      >
                        {action.label}
                      </MobileButton>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
      </motion.div>

      <KidBottomNav activeTab="missions" onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMissions;
