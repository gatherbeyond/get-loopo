import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hourglass, ListChecks, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  borderColor: string;
  iconColor: string;
  countColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  label,
  borderColor,
  iconColor,
  countColor,
  onClick,
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[100px] h-[120px] bg-card rounded-[20px] p-4",
        "flex flex-col items-center justify-center gap-1",
        "shadow-soft border-2 transition-all",
        borderColor
      )}
    >
      <div className={cn("w-8 h-8", iconColor)}>{icon}</div>
      <span className={cn("text-4xl font-display font-bold", countColor)}>
        {count}
      </span>
      <span className="text-sm font-body text-muted-foreground">{label}</span>
    </motion.button>
  );
};

interface QuickStatsSectionProps {
  pendingApprovals: number;
  activeTasks: number;
  completedThisWeek: number;
  onPendingClick?: () => void;
  onActiveClick?: () => void;
  onCompletedClick?: () => void;
}

const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({
  pendingApprovals,
  activeTasks,
  completedThisWeek,
  onPendingClick,
  onActiveClick,
  onCompletedClick,
}) => {
  const navigate = useNavigate();

  const handlePendingClick = () => {
    navigate("/parent/approvals");
    onPendingClick?.();
  };

  return (
    <section className="mt-6 px-5">
      <h2 className="text-xl font-display font-bold text-foreground mb-4">
        Quick Stats
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        <StatCard
          icon={<Hourglass className="w-full h-full" />}
          count={pendingApprovals}
          label="Pending"
          borderColor="border-accent-gold"
          iconColor="text-accent-gold"
          countColor="text-accent-gold"
          onClick={handlePendingClick}
        />
        <StatCard
          icon={<ListChecks className="w-full h-full" />}
          count={activeTasks}
          label="Active Tasks"
          borderColor="border-primary"
          iconColor="text-primary"
          countColor="text-primary"
          onClick={onActiveClick}
        />
        <StatCard
          icon={<Trophy className="w-full h-full" />}
          count={completedThisWeek}
          label="Completed"
          borderColor="border-success"
          iconColor="text-success"
          countColor="text-success"
          onClick={onCompletedClick}
        />
      </div>
    </section>
  );
};

export { QuickStatsSection };
