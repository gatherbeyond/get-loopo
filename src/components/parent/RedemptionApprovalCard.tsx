import React from "react";
import { motion, PanInfo } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";

export interface RedemptionApprovalItem {
  id: string;
  type: "redemption";
  kidName: string;
  kidAvatar: string;
  productId: string;
  productName: string;
  productImage: string;
  costCredits: number;
  balanceBefore: number;
  balanceAfter: number;
  timeAgo: string;
}

interface RedemptionApprovalCardProps {
  item: RedemptionApprovalItem;
  swipingId: string | null;
  swipeDirection: "left" | "right" | null;
  onSwipeUpdate: (id: string, info: PanInfo) => void;
  onSwipeEnd: (id: string, info: PanInfo) => void;
  onApprove: () => void;
  onDeny: () => void;
}

const RedemptionApprovalCard: React.FC<RedemptionApprovalCardProps> = ({
  item,
  swipingId,
  swipeDirection,
  onSwipeUpdate,
  onSwipeEnd,
  onApprove,
  onDeny,
}) => {
  const isLowBalance = item.balanceAfter < 1000;
  const isInsufficientBalance = item.balanceAfter < 0;

  return (
    <div className="relative">
      {/* Swipe Background Indicators */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-success transition-opacity duration-200",
            swipingId === item.id && swipeDirection === "right" ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-error transition-opacity duration-200",
            swipingId === item.id && swipeDirection === "left" ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => onSwipeUpdate(item.id, info)}
        onDragEnd={(_, info) => onSwipeEnd(item.id, info)}
        className="bg-card rounded-[20px] border border-border p-5 shadow-soft relative"
      >
        {/* Top Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {item.kidAvatar}
            </div>
            <span className="font-display font-bold text-base text-foreground">
              {item.kidName}
            </span>
          </div>
          <span className="font-body text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {item.timeAgo}
          </span>
        </div>

        {/* Type Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 font-display font-bold text-xs text-primary">
            🎁 REDEMPTION REQUEST
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-display font-bold text-xl text-foreground mb-3">
          {item.productName}
        </h3>

        {/* Product Image */}
        <img
          src={item.productImage}
          alt={item.productName}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />

        {/* Cost */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-body text-sm text-muted-foreground">Cost:</span>
          <CoinIcon size={20} />
          <span className="font-display font-bold text-lg text-accent-gold">
            {item.costCredits.toLocaleString()} credits
          </span>
        </div>

        {/* Balance Info Card */}
        <div className="bg-primary/5 rounded-xl p-4 mb-4">
          <p className="font-body text-sm text-muted-foreground mb-2">
            {item.kidName}'s balance:
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-foreground">Current:</span>
              <span className="font-display font-bold text-sm text-foreground">
                {item.balanceBefore.toLocaleString()}
              </span>
            </div>
            <span className="font-body text-sm text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-foreground">After:</span>
              <span
                className={cn(
                  "font-display font-bold text-sm",
                  isInsufficientBalance ? "text-error" : isLowBalance ? "text-accent-gold" : "text-foreground"
                )}
              >
                {item.balanceAfter.toLocaleString()}
              </span>
            </div>
          </div>

          {isInsufficientBalance && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-4 h-4 text-error" />
              <span className="font-body text-xs text-error font-semibold">
                Insufficient balance
              </span>
            </div>
          )}
          {!isInsufficientBalance && isLowBalance && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-4 h-4 text-accent-gold" />
              <span className="font-body text-xs text-accent-gold font-semibold">
                Low balance after redemption
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDeny}
            className="flex-1 h-[52px] rounded-2xl border-2 border-error bg-transparent font-display font-bold text-sm text-error transition-colors hover:bg-error/10"
          >
            Deny
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onApprove}
            disabled={isInsufficientBalance}
            className={cn(
              "flex-1 h-[52px] rounded-2xl font-display font-bold text-sm transition-colors",
              isInsufficientBalance
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-success text-success-foreground hover:bg-success/90"
            )}
          >
            Approve ✓
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RedemptionApprovalCard;
