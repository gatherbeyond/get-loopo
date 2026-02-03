import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Check, Sparkles } from "lucide-react";
import { CoinIcon } from "@/components/mobile";

interface MarketplaceRewardCardProps {
  id: string;
  name: string;
  image: string;
  creditCost: number;
  userCredits: number;
  category: string;
  isNew?: boolean;
  isPending?: boolean;
  isSoldOut?: boolean;
  limitedTime?: string;
  onRedeem: (id: string) => void;
  className?: string;
}

const MarketplaceRewardCard: React.FC<MarketplaceRewardCardProps> = ({
  id,
  name,
  image,
  creditCost,
  userCredits,
  isNew,
  isPending,
  isSoldOut,
  limitedTime,
  onRedeem,
  className,
}) => {
  const canAfford = userCredits >= creditCost;
  const creditsNeeded = creditCost - userCredits;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative bg-card rounded-2xl border border-border overflow-hidden",
        "shadow-[0px_2px_8px_rgba(0,0,0,0.08)]",
        !canAfford && !isPending && "opacity-70",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {canAfford && !isPending && !isSoldOut && (
          <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <Check className="w-4 h-4 text-success-foreground" />
          </div>
        )}
        {isNew && (
          <div className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-[10px] font-display font-bold">
            NEW!
          </div>
        )}
        {limitedTime && (
          <div className="bg-warning text-warning-foreground px-2 py-0.5 rounded-full text-[10px] font-display font-bold">
            {limitedTime}
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full h-[120px] bg-muted overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="font-display font-bold text-card text-lg rotate-[-15deg]">
              SOLD OUT
            </span>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <span className="font-display font-bold text-primary text-sm bg-card/90 px-3 py-1 rounded-full">
              ⏳ Pending
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3">
        {/* Product Name */}
        <h3 className="font-display font-bold text-sm text-foreground line-clamp-2 min-h-[40px]">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1.5 mt-2">
          <CoinIcon size={20} />
          <span className="font-display font-bold text-base text-accent-gold">
            {creditCost.toLocaleString()}
          </span>
        </div>

        {/* Affordability hint */}
        {!canAfford && !isPending && !isSoldOut && (
          <p className="text-[10px] font-body text-warning mt-1">
            💪 Keep earning!
          </p>
        )}

        {/* Action Button */}
        <div className="mt-3">
          {isSoldOut ? (
            <button
              disabled
              className="w-full h-10 rounded-xl bg-muted text-muted-foreground font-display font-bold text-sm"
            >
              Sold Out
            </button>
          ) : isPending ? (
            <button
              disabled
              className="w-full h-10 rounded-xl bg-warning/20 text-warning font-display font-bold text-sm"
            >
              Awaiting Approval
            </button>
          ) : canAfford ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRedeem(id)}
              className="w-full h-10 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              Redeem
            </motion.button>
          ) : (
            <button
              disabled
              className="w-full h-10 rounded-xl bg-muted text-muted-foreground font-body text-xs flex items-center justify-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Need {creditsNeeded.toLocaleString()} more
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export { MarketplaceRewardCard };
export type { MarketplaceRewardCardProps };
