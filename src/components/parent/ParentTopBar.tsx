import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParentTopBarProps {
  familyName: string;
  avatarUrl?: string;
  initial?: string;
  onProfileClick?: () => void;
}

const ParentTopBar: React.FC<ParentTopBarProps> = ({
  familyName,
  avatarUrl,
  initial = "P",
  onProfileClick,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-card border-b border-border",
        "flex items-center justify-between px-5"
      )}
      style={{
        paddingTop: "max(env(safe-area-inset-top), 12px)",
        height: "calc(60px + max(env(safe-area-inset-top), 12px))",
      }}
    >
      {/* Family Name */}
      <h1 className="font-display font-bold text-lg text-foreground">
        {familyName}
      </h1>

      {/* Right Actions */}
      <div className="flex items-center gap-2">

        {/* Profile Avatar */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary font-display font-bold text-sm">
              {initial}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

export { ParentTopBar };
