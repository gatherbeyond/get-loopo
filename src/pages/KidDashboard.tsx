import * as React from "react";
import { motion } from "framer-motion";
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
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    if (!user?.kidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tasksRes, creditsRes] = await Promise.all([
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
      ]);

      if (tasksRes.data) {
        setMissions(
          tasksRes.data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            creditReward: t.credits_reward,
            status: mapStatus(t.status),
          }))
        );
      }
      if (creditsRes.data) {
        setCredits(creditsRes.data.credits_balance ?? 0);
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
          </>
        )}
        <div className="h-8" />
      </motion.main>

      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidDashboard;
