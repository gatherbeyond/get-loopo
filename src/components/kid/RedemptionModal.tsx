import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
import { CoinIcon } from "@/components/mobile";
import { cn } from "@/lib/utils";

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reward: {
    id: string;
    name: string;
    image: string;
    creditCost: number;
  } | null;
  userCredits: number;
  isLoading?: boolean;
}

const RedemptionModal: React.FC<RedemptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reward,
  userCredits,
  isLoading,
}) => {
  if (!reward) return null;

  const balanceAfter = userCredits - reward.creditCost;
  const isLowBalance = balanceAfter < 500;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Header */}
              <h2 className="font-display font-bold text-2xl text-foreground mb-6">
                Request Approval?
              </h2>

              {/* Product Image */}
              <div className="w-[100px] h-[100px] rounded-xl bg-muted overflow-hidden mb-4">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Name */}
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {reward.name}
              </h3>

              {/* Credit Cost */}
              <div className="flex items-center gap-2 mb-4">
                <CoinIcon size={32} />
                <span className="font-display font-bold text-2xl text-accent-gold">
                  {reward.creditCost.toLocaleString()} credits
                </span>
              </div>

              {/* Balance Info */}
              <div className="w-full space-y-1 mb-3">
                <p className="font-body text-sm text-muted-foreground">
                  Your balance: {userCredits.toLocaleString()} credits
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  After redemption: {balanceAfter.toLocaleString()} credits
                </p>
              </div>

              {/* Low Balance Warning */}
              {isLowBalance && (
                <div className="w-full bg-warning/10 rounded-lg px-3 py-2 mb-4">
                  <p className="font-body text-xs text-warning">
                    ⚠️ You'll have low credits after this
                  </p>
                </div>
              )}

              {/* How This Works Card */}
              <div className="w-full bg-background-tint border border-primary/20 rounded-xl p-4 my-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-sm text-foreground">
                    How this works:
                  </span>
                </div>
                <div className="text-left space-y-2">
                  <p className="font-body text-[13px] text-muted-foreground">
                    1. Your parent will review this request
                  </p>
                  <p className="font-body text-[13px] text-muted-foreground">
                    2. If approved, the code appears in your Rewards
                  </p>
                  <p className="font-body text-[13px] text-muted-foreground">
                    3. Your parent also gets the code via email
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "w-[30%] h-[52px] rounded-xl border border-border bg-card",
                    "font-body text-base text-foreground",
                    "disabled:opacity-50"
                  )}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "w-[70%] h-[52px] rounded-xl bg-primary",
                    "text-primary-foreground font-display font-bold text-base",
                    "shadow-lg shadow-primary/30",
                    "disabled:opacity-70"
                  )}
                >
                  {isLoading ? "Sending..." : "Request Approval"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { RedemptionModal };
