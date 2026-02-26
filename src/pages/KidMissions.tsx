import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

const mockMissions: Mission[] = [
  { id: "1", title: "Clean your room", description: "Organize toys, make your bed, and tidy up your desk", creditReward: 500, status: "not_started" },
  { id: "2", title: "Finish homework", description: "Complete all your math and reading assignments", creditReward: 300, status: "in_progress" },
  { id: "3", title: "Help with dishes", description: "Wash and dry the dishes after dinner", creditReward: 200, status: "pending_approval" },
  { id: "4", title: "Read for 30 minutes", description: "Read any book you like for at least 30 minutes", creditReward: 150, status: "not_started" },
  { id: "5", title: "Walk the dog", description: "Take the dog for a 20-minute walk around the block", creditReward: 250, status: "completed" },
  { id: "6", title: "Practice piano", description: "Practice your piano lessons for 15 minutes", creditReward: 200, status: "completed" },
];

type FilterTab = "all" | MissionStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Missions" },
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "pending_approval", label: "Waiting Approval" },
  { id: "completed", label: "Completed" },
];

const statusConfig: Record<MissionStatus, { label: string; bgClass: string; textClass: string }> = {
  not_started: { label: "Not Started", bgClass: "bg-muted", textClass: "text-muted-foreground" },
  in_progress: { label: "In Progress", bgClass: "bg-primary", textClass: "text-primary-foreground" },
  pending_approval: { label: "Pending", bgClass: "bg-accent-gold", textClass: "text-accent-gold-foreground" },
  completed: { label: "Completed", bgClass: "bg-success", textClass: "text-success-foreground" },
};

const actionConfig: Record<MissionStatus, { label: string; variant: "primary" | "ghost"; disabled: boolean }> = {
  not_started: { label: "Start Mission", variant: "primary", disabled: false },
  in_progress: { label: "Mark Complete", variant: "primary", disabled: false },
  pending_approval: { label: "Waiting...", variant: "ghost", disabled: true },
  completed: { label: "Done ✓", variant: "ghost", disabled: true },
};

const KidMissions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("all");
  const [missions, setMissions] = React.useState(mockMissions);

  const filteredMissions = activeFilter === "all"
    ? missions
    : missions.filter((m) => m.status === activeFilter);

  const handleMissionAction = (missionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMissions((prev) =>
      prev.map((mission) => {
        if (mission.id === missionId) {
          if (mission.status === "not_started") {
            toast({ title: "Mission Started! 🚀", description: `You started "${mission.title}"` });
            return { ...mission, status: "in_progress" as const };
          }
          if (mission.status === "in_progress") {
            toast({ title: "Waiting for approval! ⏳", description: "Your parent will review your work" });
            return { ...mission, status: "pending_approval" as const };
          }
        }
        return mission;
      })
    );
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

      {/* Mission List */}
      <motion.div
        className="px-5 mt-2 flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
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
                  {/* Top row: title + status */}
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

                  {/* Bottom row: credits + action */}
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
      </motion.div>

      <KidBottomNav activeTab="missions" onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMissions;
