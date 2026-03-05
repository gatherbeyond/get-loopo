import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  ParentTopBar,
  FamilyCreditsCard,
  QuickStatsSection,
  ActivityFeed,
  FloatingActionButton,
  ParentBottomNav,
  type ActivityItem,
  type TabId,
} from "@/components/parent";

interface FamilyData {
  id: string;
  family_name: string;
  family_code: string;
  parent_id: string;
}

interface KidData {
  id: string;
  name: string;
  avatar: string;
  credits_balance: number | null;
}

interface TaskData {
  id: string;
  title: string;
  status: string;
  credits_reward: number;
  kid_id: string;
  completed_at: string | null;
  submitted_at: string | null;
  created_at: string | null;
}

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [family, setFamily] = useState<FamilyData | null>(null);
  const [kids, setKids] = useState<KidData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Get the current Supabase user
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (!supaUser) {
          setError("Not authenticated");
          return;
        }

        // 2. Fetch family
        const { data: familyData, error: familyError } = await supabase
          .from("families")
          .select("*")
          .eq("parent_id", supaUser.id)
          .maybeSingle();

        if (familyError) throw familyError;
        if (!familyData) {
          setError("No family found. Please complete signup first.");
          return;
        }

        setFamily(familyData);

        // 3. Fetch kids and tasks in parallel
        const [kidsResult, tasksResult] = await Promise.all([
          supabase
            .from("kids")
            .select("id, name, avatar, credits_balance")
            .eq("family_id", familyData.id),
          supabase
            .from("tasks")
            .select("id, title, status, credits_reward, kid_id, completed_at, submitted_at, created_at")
            .eq("family_id", familyData.id)
            .order("created_at", { ascending: false }),
        ]);

        if (kidsResult.error) throw kidsResult.error;
        if (tasksResult.error) throw tasksResult.error;

        setKids(kidsResult.data || []);
        setTasks(tasksResult.data || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Derived data
  const totalCredits = kids.reduce((sum, kid) => sum + (kid.credits_balance || 0), 0);
  const pendingCount = tasks.filter((t) => t.status === "pending_approval").length;
  const activeCount = tasks.filter((t) => ["not_started", "in_progress"].includes(t.status)).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Build activity items from recently completed/submitted tasks
  const kidsMap = new Map(kids.map((k) => [k.id, k]));

  const recentActivities: ActivityItem[] = tasks
    .filter((t) => t.status === "completed" || t.status === "pending_approval")
    .slice(0, 10)
    .map((t) => {
      const kid = kidsMap.get(t.kid_id);
      const timestamp = t.completed_at || t.submitted_at || t.created_at;
      return {
        id: t.id,
        kidName: kid?.name || "Unknown",
        kidAvatar: kid?.avatar || "👤",
        action: t.status === "completed" ? "completed" : "submitted",
        taskName: t.title,
        credits: t.credits_reward,
        timeAgo: timestamp
          ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
          : "recently",
      };
    });

  const handleProfileClick = () => navigate("/parent/settings");
  const handleFabClick = () => navigate("/parent/add-task");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-tint flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-tint flex flex-col items-center justify-center px-8 text-center gap-4">
        <p className="text-lg font-display font-bold text-foreground">Something went wrong</p>
        <p className="text-sm font-body text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="text-primary font-body font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-tint">
      <div className="mx-auto max-w-md min-h-screen relative overflow-hidden">
        <ParentTopBar
          familyName={family?.family_name || "My Family"}
          onProfileClick={handleProfileClick}
        />

        <main className="overflow-y-auto">
          <FamilyCreditsCard totalCredits={totalCredits} kidCount={kids.length} />

          <QuickStatsSection
            pendingApprovals={pendingCount}
            activeTasks={activeCount}
            completedThisWeek={completedCount}
            onPendingClick={() => navigate("/parent/approvals")}
            onActiveClick={() => navigate("/parent/tasks")}
            onCompletedClick={() => navigate("/parent/tasks")}
          />

          <ActivityFeed
            activities={recentActivities}
            onViewAll={() => navigate("/parent/tasks")}
          />
        </main>

        <FloatingActionButton onClick={handleFabClick} />
        <ParentBottomNav activeTab="home" pendingCount={pendingCount} />
      </div>
    </div>
  );
};

export default ParentDashboard;
