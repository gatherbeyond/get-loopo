import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface CreditDisplayProps {
  amount: number;
  label?: string;
  size?: "sm" | "default" | "lg" | "hero";
  showCoin?: boolean;
  animated?: boolean;
  showCreditsLabel?: boolean;
  className?: string;
}

const CoinIcon: React.FC<{ className?: string; animated?: boolean; size?: number }> = ({
  className,
  animated = false,
  size = 24,
}) => (
  <motion.div
    className={cn(
      "relative flex items-center justify-center rounded-full bg-gradient-gold shadow-gold",
      className
    )}
    animate={animated ? { rotateY: [0, 360] } : undefined}
    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
  >
    <Coins className="text-accent-gold-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
  </motion.div>
);

const sizeStyles = {
  sm: {
    container: "gap-2",
    coin: "w-6 h-6",
    coinSize: 24,
    amount: "text-xl font-display font-bold",
    credits: "text-base font-display font-medium",
    label: "text-xs",
  },
  default: {
    container: "gap-3",
    coin: "w-8 h-8",
    coinSize: 32,
    amount: "text-2xl font-display font-bold",
    credits: "text-lg font-display font-medium",
    label: "text-sm",
  },
  lg: {
    container: "gap-3",
    coin: "w-10 h-10",
    coinSize: 40,
    amount: "text-3xl font-display font-bold",
    credits: "text-xl font-display font-medium",
    label: "text-base",
  },
  hero: {
    container: "gap-4",
    coin: "w-10 h-10",
    coinSize: 40,
    amount: "text-5xl font-display font-bold",
    credits: "text-2xl font-display font-medium",
    label: "text-lg",
  },
};

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  amount,
  label,
  size = "default",
  showCoin = true,
  animated = false,
  showCreditsLabel = true,
  className,
}) => {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("flex items-center", styles.container)}>
        {showCoin && <CoinIcon className={styles.coin} animated={animated} size={styles.coinSize} />}
        <div className="flex items-baseline gap-2">
          <motion.span
            className={cn(styles.amount, "text-card-foreground")}
            key={amount}
            initial={animated ? { scale: 1.2, opacity: 0 } : undefined}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {amount.toLocaleString("en-US")}
          </motion.span>
          {showCreditsLabel && (
            <span className={cn(styles.credits, "text-muted-foreground")}>
              credits
            </span>
          )}
        </div>
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
