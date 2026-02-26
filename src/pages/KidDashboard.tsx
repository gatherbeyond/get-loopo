import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  KidTopBar,
  KidCreditHero,
  MissionCarousel,
  Mission,
  KidBottomNav,
  KidNavTab,
} from "@/components/kid";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockMissions: Mission[] = [
  {
    id: "1",
    title: "Clean your room",
    description: "Organize toys, make your bed, and tidy up your desk",
    creditReward: 500,
    status: "not_started",
  },
  {
    id: "2",
    title: "Finish homework",
    description: "Complete all your math and reading assignments",
    creditReward: 300,
    status: "in_progress",
  },
  {
    id: "3",
    title: "Help with dishes",
    description: "Wash and dry the dishes after dinner",
    creditReward: 200,
    status: "pending_approval",
  },
  {
    id: "4",
    title: "Read for 30 minutes",
    description: "Read any book you like for at least 30 minutes",
    creditReward: 150,
    status: "not_started",
  },
];


const KidDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("home");
  const [credits, setCredits] = React.useState(2450);
  const [missions, setMissions] = React.useState(mockMissions);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    logout();
    navigate("/");
  };

  const handleMissionAction = (missionId: string) => {
    setMissions((prev) =>
      prev.map((mission) => {
        if (mission.id === missionId) {
          if (mission.status === "not_started") {
            toast({
              title: "Mission Started! 🚀",
              description: `You started "${mission.title}"`,
            });
            return { ...mission, status: "in_progress" as const };
          }
          if (mission.status === "in_progress") {
            toast({
              title: "Waiting for approval! ⏳",
              description: "Your parent will review your work",
            });
            return { ...mission, status: "pending_approval" as const };
          }
        }
        return mission;
      })
    );
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "missions") {
      navigate("/kid/missions");
    } else if (tab === "shop") {
      navigate("/kid/shop");
    } else if (tab === "rewards") {
      navigate("/kid/rewards");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Bar */}
      <KidTopBar
        kidName={user?.name || "Miguel"}
        notificationCount={2}
        onAvatarClick={handleAvatarClick}
        onNotificationClick={() => {
          toast({
            title: "Notifications",
            description: "You have 2 new notifications!",
          });
        }}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero Credit Display */}
        <KidCreditHero credits={credits} className="mt-2" />

        {/* Active Missions */}
        <MissionCarousel
          missions={missions}
          onMissionAction={handleMissionAction}
          onSeeAll={() => setActiveTab("missions")}
        />


        {/* Extra bottom padding for content above nav */}
        <div className="h-8" />
      </motion.main>

      {/* Bottom Navigation */}
      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidDashboard;
