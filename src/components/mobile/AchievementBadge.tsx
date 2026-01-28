import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  unlocked?: boolean;
  size?: "sm" | "default" | "lg";
  showPulse?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    container: "w-16 h-16",
    iconContainer: "w-12 h-12",
    icon: "w-6 h-6",
    title: "text-xs mt-1",
  },
  default: {
    container: "w-20 h-20",
    iconContainer: "w-14 h-14",
    icon: "w-7 h-7",
    title: "text-sm mt-2",
  },
  lg: {
    container: "w-24 h-24",
    iconContainer: "w-16 h-16",
    icon: "w-8 h-8",
    title: "text-base mt-2",
  },
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  title,
  description,
  unlocked = true,
  size = "default",
  showPulse = false,
  className,
}) => {
  const styles = sizeStyles[size];

  return (
    <motion.div
      className={cn("flex flex-col items-center text-center", className)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          styles.iconContainer,
          unlocked
            ? "bg-gradient-primary shadow-button"
            : "bg-muted",
          showPulse && unlocked && "animate-pulse-glow"
        )}
      >
        {/* Inner glow effect */}
        {unlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        )}
        
        {/* Icon */}
        <span
          className={cn(
            styles.icon,
            "relative z-10",
            unlocked ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {icon}
        </span>
        
        {/* Locked overlay */}
        {!unlocked && (
          <div className="absolute inset-0 rounded-full bg-muted/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Title */}
      <span
        className={cn(
          "font-display font-semibold",
          styles.title,
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {title}
      </span>
      
      {/* Description */}
      {description && (
        <span className="text-xs text-muted-foreground font-body mt-0.5 max-w-[100px]">
          {description}
        </span>
      )}
    </motion.div>
  );
};

export { AchievementBadge };
