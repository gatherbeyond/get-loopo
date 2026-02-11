import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info, Check, Share2, Download } from "lucide-react";
import { MobileButton } from "@/components/mobile";

interface FamilyCodeDisplayStepProps {
  familyName: string;
  familyCode: string;
  onContinue: () => void;
}

const FamilyCodeDisplayStep = ({
  familyName,
  familyCode,
  onContinue,
}: FamilyCodeDisplayStepProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Loopo Family Code",
          text: `Your Loopo family code is: ${familyCode}`,
        });
      } catch {
        // cancelled
      }
    }
  };

  const codeChars = familyCode.split("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-full px-5"
    >
      {/* Success Icon */}
      <div className="flex flex-col items-center pt-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-success flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-success-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[28px] font-display font-bold text-foreground text-center mt-6"
        >
          Family Created!
        </motion.h1>

        {/* Family Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-background-tint rounded-2xl px-5 py-3"
        >
          <span className="text-lg font-display font-bold text-primary">{familyName}</span>
        </motion.div>
      </div>

      {/* Family Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex-1 mt-8"
      >
        <p className="text-xl font-display font-bold text-foreground text-center mb-4">
          Your Family Code:
        </p>

        {/* Code Display */}
        <div className="bg-card border-[3px] border-primary rounded-[20px] p-6 shadow-elevated mx-auto">
          <div className="flex justify-center gap-1">
            {codeChars.map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="w-12 h-14 bg-muted border-2 border-border rounded-xl flex items-center justify-center"
              >
                <span className="text-[32px] font-display font-bold text-primary">{char}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={handleCopy}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-display font-bold text-[13px] flex items-center justify-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied! ✓
              </>
            ) : (
              <>📋 Copy Code</>
            )}
          </button>
          <button
            onClick={() => {}}
            className="flex-1 h-10 rounded-xl border border-primary text-primary font-display font-bold text-[13px] flex items-center justify-center gap-1"
          >
            <Download className="w-4 h-4" /> Save Image
          </button>
          <button
            onClick={handleShare}
            className="flex-1 h-10 rounded-xl border border-primary text-primary font-display font-bold text-[13px] flex items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-background-tint border border-primary/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-base text-primary mb-2">Important:</p>
              <ul className="space-y-1.5 text-sm font-body text-muted-foreground leading-relaxed">
                <li>• All your kids will use this SAME code to log in</li>
                <li>• Each kid will have their own PIN</li>
                <li>• You can view this code anytime in Settings</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Button */}
      <div className="pb-8 pt-6 safe-area-bottom border-t border-border">
        <MobileButton variant="primary" fullWidth onClick={onContinue}>
          Continue to Add Kids
        </MobileButton>
      </div>
    </motion.div>
  );
};

export default FamilyCodeDisplayStep;
