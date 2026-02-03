import * as React from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileButton } from "@/components/mobile";

type MissionStatus = "not_started" | "in_progress" | "pending_approval" | "completed";

interface MissionCardProps {
  title: string;
  description: string;
  creditReward: number;
  status: MissionStatus;
  onAction?: () => void;
  className?: string;
}

const statusConfig: Record<MissionStatus, { label: string; bgClass: string; textClass: string }> = {
  not_started: {
    label: "Not Started",
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    bgClass: "bg-primary",
    textClass: "text-primary-foreground",
  },
  pending_approval: {
    label: "Pending",
    bgClass: "bg-accent-gold",
    textClass: "text-accent-gold-foreground",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-success",
    textClass: "text-success-foreground",
  },
};

const actionLabels: Record<MissionStatus, string> = {
  not_started: "Start Mission",
  in_progress: "Mark Complete",
  pending_approval: "Waiting...",
  completed: "Completed! 🎉",
};

const MissionCard: React.FC<MissionCardProps> = ({
  title,
  description,
  creditReward,
  status,
  onAction,
  className,
}) => {
  const statusInfo = statusConfig[status];
  const actionLabel = actionLabels[status];
  const isActionable = status === "not_started" || status === "in_progress";

  return (
    <motion.div
      className={cn(
        "w-[280px] h-[200px] flex-shrink-0 bg-card rounded-[20px] p-5 flex flex-col",
        className
      )}
      style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" }}
      whileTap={isActionable ? { scale: 0.98 } : undefined}
    >
      {/* Status Badge */}
      <div className="flex justify-end mb-2">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-body font-semibold",
            statusInfo.bgClass,
            statusInfo.textClass
          )}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Task Info */}
      <h3 className="font-display font-bold text-lg text-foreground line-clamp-2 mb-1">
        {title}
      </h3>
      <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
        {description}
      </p>

      {/* Credit Reward */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
        >
          <Coins className="w-4 h-4 text-foreground" />
        </div>
        <span className="font-display font-bold text-2xl text-accent-gold">
          {creditReward.toLocaleString()} credits
        </span>
      </div>

      {/* Action Button */}
      <MobileButton
        variant={isActionable ? "primary" : "ghost"}
        size="sm"
        onClick={onAction}
        disabled={!isActionable}
        className="mt-auto h-11"
      >
        {actionLabel}
      </MobileButton>
    </motion.div>
  );
};

export { MissionCard };
export type { MissionStatus };
