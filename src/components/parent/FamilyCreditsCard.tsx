import React from "react";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/mobile/CreditDisplay";

interface FamilyCreditsCardProps {
  totalCredits: number;
  kidCount: number;
}

const FamilyCreditsCard: React.FC<FamilyCreditsCardProps> = ({
  totalCredits,
  kidCount,
}) => {
  const formattedCredits = totalCredits.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-5 mt-5 rounded-3xl p-6 bg-gradient-primary shadow-elevated"
    >
      <p className="text-sm font-body text-primary-foreground/80 mb-1">
        Total Family Credits
      </p>
      <div className="flex items-center gap-3">
        <span className="text-5xl font-display font-bold text-primary-foreground">
          {formattedCredits}
        </span>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <CoinIcon size={40} />
        </motion.div>
      </div>
      <p className="text-xs font-body text-primary-foreground/70 mt-2">
        across {kidCount} kid{kidCount !== 1 ? "s" : ""}
      </p>
    </motion.div>
  );
};

export { FamilyCreditsCard };
