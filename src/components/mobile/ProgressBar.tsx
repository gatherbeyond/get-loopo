import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "primary" | "success" | "gold";
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "h-2",
  default: "h-3",
  lg: "h-4",
};

const variantStyles = {
  primary: "bg-gradient-primary",
  success: "bg-gradient-success",
  gold: "bg-gradient-gold",
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = "default",
  variant = "primary",
  animated = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-body font-semibold text-foreground">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-display font-bold text-primary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeStyles[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full relative",
            variantStyles[variant]
          )}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </div>
  );
};

export { ProgressBar };
