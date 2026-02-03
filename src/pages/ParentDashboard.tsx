import React, { useState } from "react";
import { motion } from "framer-motion";
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

// Mock data for demonstration
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    kidName: "Miguel",
    kidAvatar: "🧒",
    action: "completed",
    taskName: "Clean room",
    credits: 500,
    timeAgo: "2 min ago",
  },
  {
    id: "2",
    kidName: "Sofia",
    kidAvatar: "👧",
    action: "completed",
    taskName: "Do homework",
    credits: 300,
    timeAgo: "15 min ago",
  },
  {
    id: "3",
    kidName: "Miguel",
    kidAvatar: "🧒",
    action: "completed",
    taskName: "Walk the dog",
    credits: 400,
    timeAgo: "1 hour ago",
  },
  {
    id: "4",
    kidName: "Sofia",
    kidAvatar: "👧",
    action: "completed",
    taskName: "Set the table",
    credits: 200,
    timeAgo: "2 hours ago",
  },
  {
    id: "5",
    kidName: "Miguel",
    kidAvatar: "🧒",
    action: "completed",
    taskName: "Practice piano",
    credits: 350,
    timeAgo: "3 hours ago",
  },
];

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleFabClick = () => {
    console.log("FAB clicked - Create new task");
  };

  const handleViewAllActivities = () => {
    console.log("View all activities");
  };

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Mobile Frame Container */}
      <div className="mx-auto max-w-md min-h-screen relative overflow-hidden">
        {/* Top Bar */}
        <ParentTopBar
          familyName="The Santos Family"
          hasNotifications={true}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
        />

        {/* Main Content */}
        <main className="overflow-y-auto">
          {/* Hero Card - Total Family Credits */}
          <FamilyCreditsCard totalCredits={12450} kidCount={2} />

          {/* Quick Stats */}
          <QuickStatsSection
            pendingApprovals={3}
            activeTasks={8}
            completedThisWeek={12}
            onPendingClick={() => console.log("Navigate to pending")}
            onActiveClick={() => console.log("Navigate to active tasks")}
            onCompletedClick={() => console.log("Navigate to completed")}
          />

          {/* Activity Feed */}
          <ActivityFeed
            activities={mockActivities}
            onViewAll={handleViewAllActivities}
          />
        </main>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={handleFabClick} />

        {/* Bottom Navigation */}
        <ParentBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default ParentDashboard;
