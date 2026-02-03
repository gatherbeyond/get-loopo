import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CoinIcon } from "@/components/mobile";

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[32px] p-6"
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
              {/* Product Image */}
              <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden mb-4">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Name */}
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                {reward.name}
              </h2>

              {/* Credit Cost */}
              <div className="flex items-center gap-2 mb-2">
                <CoinIcon size={28} />
                <span className="font-display font-bold text-2xl text-accent-gold">
                  {reward.creditCost.toLocaleString()} credits
                </span>
              </div>

              {/* Balance After */}
              <p className="font-body text-sm text-muted-foreground mb-6">
                Your balance after:{" "}
                <span className="font-bold text-foreground">
                  {balanceAfter.toLocaleString()} credits
                </span>
              </p>

              {/* Description */}
              <div className="bg-background-tint rounded-xl p-4 mb-6 w-full">
                <p className="font-body text-sm text-foreground mb-1">
                  📧 You'll receive a code via email
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Code can be used in the app or website
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-[2] h-12 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-base disabled:opacity-70"
                >
                  {isLoading ? "Sending..." : "Request Approval"}
                </motion.button>
              </div>

              {/* Approval Note */}
              <p className="font-body text-xs text-muted-foreground mt-4">
                🔒 Parent approval required
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { RedemptionModal };
