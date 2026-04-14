import React from "react";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/mobile";

export interface FamilyRewardApprovalItem {
  id: string;
  type: "family_reward";
  kidName: string;
  kidAvatar: string;
  rewardTitle: string;
  creditsCost: number;
  timeAgo: string;
  kidId: string;
}

interface FamilyRewardApprovalCardProps {
  item: FamilyRewardApprovalItem;
  onApprove: () => void;
  onDeny: () => void;
}

const FamilyRewardApprovalCard: React.FC<FamilyRewardApprovalCardProps> = ({
  item,
  onApprove,
  onDeny,
}) => {
  return (
    <div className="bg-card rounded-[20px] border border-border p-5 shadow-soft">
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-teal/10 font-display font-bold text-xs text-accent-teal">
          🎁 FAMILY REWARD REQUEST
        </span>
      </div>

      {/* Reward Title */}
      <h3 className="font-display font-bold text-xl text-foreground mb-3">
        {item.rewardTitle}
      </h3>

      {/* Cost */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-body text-sm text-muted-foreground">Cost:</span>
        <CoinIcon size={20} />
        <span className="font-display font-bold text-lg text-accent-gold">
          {item.creditsCost.toLocaleString()} credits
        </span>
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
          className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-sm text-success-foreground transition-colors hover:bg-success/90"
        >
          Approve ✓
        </motion.button>
      </div>
    </div>
  );
};

export default FamilyRewardApprovalCard;
