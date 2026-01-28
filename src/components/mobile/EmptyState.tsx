import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MobileButton } from "./MobileButton";
import loopoMascot from "@/assets/loopo-mascot.png";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "error" | "success" | "loading";
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 py-12",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mascot */}
      <motion.img
        src={loopoMascot}
        alt="Loopo mascot"
        className="w-32 h-32 object-contain mb-6"
        animate={
          variant === "loading"
            ? { y: [0, -10, 0] }
            : variant === "success"
            ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            : { y: [0, -5, 0] }
        }
        transition={{
          duration: variant === "loading" ? 1 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Title */}
      <h3 className="text-kid-header font-display text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-kid-body font-body text-muted-foreground max-w-xs mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <MobileButton onClick={onAction} variant="primary">
          {actionLabel}
        </MobileButton>
      )}
    </motion.div>
  );
};

export { EmptyState };
