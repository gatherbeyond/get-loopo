import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed z-50 w-[60px] h-[60px] rounded-full",
        "bg-gradient-primary shadow-elevated",
        "flex items-center justify-center",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      style={{
        bottom: "calc(80px + max(env(safe-area-inset-bottom), 12px))",
        right: "16px",
        boxShadow: "0px 4px 16px rgba(98, 0, 230, 0.4)",
      }}
    >
      <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
    </motion.button>
  );
};

export { FloatingActionButton };
