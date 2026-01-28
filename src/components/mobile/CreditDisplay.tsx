import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CreditDisplayProps {
  amount: number;
  label?: string;
  size?: "sm" | "default" | "lg" | "hero";
  showCoin?: boolean;
  animated?: boolean;
  className?: string;
}

const CoinIcon: React.FC<{ className?: string; animated?: boolean }> = ({
  className,
  animated = false,
}) => (
  <motion.div
    className={cn(
      "relative flex items-center justify-center rounded-full bg-gradient-gold shadow-gold",
      className
    )}
    animate={animated ? { rotateY: [0, 360] } : undefined}
    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
  >
    <span className="font-display font-bold text-accent-gold-foreground">$</span>
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
  </motion.div>
);

const sizeStyles = {
  sm: {
    container: "gap-2",
    coin: "w-6 h-6 text-xs",
    amount: "text-xl font-display font-bold",
    label: "text-xs",
  },
  default: {
    container: "gap-3",
    coin: "w-8 h-8 text-sm",
    amount: "text-2xl font-display font-bold",
    label: "text-sm",
  },
  lg: {
    container: "gap-3",
    coin: "w-10 h-10 text-base",
    amount: "text-3xl font-display font-bold",
    label: "text-base",
  },
  hero: {
    container: "gap-4",
    coin: "w-14 h-14 text-xl",
    amount: "text-kid-hero font-display font-bold",
    label: "text-lg",
  },
};

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  amount,
  label,
  size = "default",
  showCoin = true,
  animated = false,
  className,
}) => {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("flex items-center", styles.container)}>
        {showCoin && <CoinIcon className={styles.coin} animated={animated} />}
        <motion.span
          className={cn(styles.amount, "text-card-foreground")}
          key={amount}
          initial={animated ? { scale: 1.2, opacity: 0 } : undefined}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </motion.span>
      </div>
      {label && (
        <span className={cn(styles.label, "text-muted-foreground font-body mt-1")}>
          {label}
        </span>
      )}
    </div>
  );
};

export { CreditDisplay, CoinIcon };
