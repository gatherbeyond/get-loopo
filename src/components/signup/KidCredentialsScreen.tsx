import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Info, Share2 } from "lucide-react";
import { MobileButton } from "@/components/mobile";
import loopoMascot from "@/assets/loopo-mascot.png";

interface KidCredentialsScreenProps {
  kidName: string;
  familyCode: string;
  kidPin: string;
  onAddAnother: () => void;
  onDone: () => void;
}

const KidCredentialsScreen = ({
  kidName,
  familyCode,
  kidPin,
  onAddAnother,
  onDone,
}: KidCredentialsScreenProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Loopo Login for ${kidName}\nFamily Code: ${familyCode}\nPIN: ${kidPin}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Loopo Login for ${kidName}`,
          text: `Family Code: ${familyCode}\nPIN: ${kidPin}`,
        });
      } catch {}
    }
  };

  const pinDigits = kidPin.split("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-full px-5"
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-success-foreground" />
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-foreground text-center mt-4">
          ✅ {kidName}'s Account Created!
        </h1>
      </div>

      {/* Credentials Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-card border-2 border-primary rounded-[20px] p-6 shadow-card"
      >
        <p className="text-lg font-display font-bold text-foreground mb-4">
          Here's how {kidName} logs in:
        </p>

        {/* Family Code */}
        <div className="mb-5">
          <p className="text-sm font-body text-muted-foreground">Family Code:</p>
          <p className="text-[28px] font-display font-bold text-primary tracking-wider">
            {familyCode}
          </p>
          <span className="text-[11px] font-body text-text-muted">(Same for all kids)</span>
        </div>

        {/* Kid PIN */}
        <div>
          <p className="text-sm font-body text-muted-foreground">{kidName}'s PIN:</p>
          <div className="flex gap-2 mt-2">
            {pinDigits.map((digit, i) => (
              <div
                key={i}
                className="w-14 h-16 bg-muted border-2 border-border rounded-xl flex items-center justify-center"
              >
                <span className="text-[28px] font-display font-bold text-primary">{digit}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-1"
        >
          {copied ? "Copied! ✓" : "📋 Copy Info"}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 h-11 rounded-xl border border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-1"
        >
          <Share2 className="w-4 h-4" /> Share via Message
        </button>
      </div>

      {/* Helper Info */}
      <div className="mt-4 bg-background-tint rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="text-[13px] font-body text-muted-foreground space-y-1">
            <p>{kidName} needs both pieces of info to log in</p>
            <p>Keep this safe - you can view it anytime in Settings</p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pb-8 pt-6 safe-area-bottom space-y-3">
        <button
          onClick={onAddAnother}
          className="w-full h-[52px] rounded-2xl border-2 border-primary text-primary font-display font-bold text-base flex items-center justify-center gap-2"
        >
          + Add Another Kid
        </button>
        <MobileButton variant="primary" fullWidth onClick={onDone}>
          Done - Go to Dashboard
        </MobileButton>
      </div>
    </motion.div>
  );
};

export default KidCredentialsScreen;
