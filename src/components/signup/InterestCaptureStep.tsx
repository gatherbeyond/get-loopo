import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gamepad2,
  Trophy,
  Palette,
  Music,
  BookOpen,
  ChefHat,
  PawPrint,
  Cpu,
  Film,
  TreePine,
} from "lucide-react";
import { MobileButton } from "@/components/mobile";
import { MobileCard } from "@/components/mobile/MobileCard";

interface InterestCaptureStepProps {
  kidName: string;
  selectedInterests: string[];
  onUpdate: (interests: string[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

const interests = [
  { label: "Gaming", icon: Gamepad2 },
  { label: "Sports", icon: Trophy },
  { label: "Art", icon: Palette },
  { label: "Music", icon: Music },
  { label: "Books", icon: BookOpen },
  { label: "Cooking", icon: ChefHat },
  { label: "Pets", icon: PawPrint },
  { label: "Tech", icon: Cpu },
  { label: "Movies", icon: Film },
  { label: "Outdoors", icon: TreePine },
];

const InterestCaptureStep = ({
  kidName,
  selectedInterests,
  onUpdate,
  onComplete,
  onBack,
}: InterestCaptureStepProps) => {
  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
      onUpdate(selectedInterests.filter((i) => i !== label));
    } else {
      onUpdate([...selectedInterests, label]);
    }
  };

  const isValid = selectedInterests.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-full px-5"
    >
      {/* Header */}
      <div className="pt-6">
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>

        <h1 className="text-[28px] font-display font-bold text-foreground mt-4">
          What does {kidName} love?
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          Pick at least 2 interests
        </p>
      </div>

      {/* Interest Grid */}
      <div className="flex-1 mt-8">
        <div className="grid grid-cols-2 gap-3">
          {interests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.label);
            const Icon = interest.icon;

            return (
              <motion.button
                key={interest.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleInterest(interest.label)}
                className="text-left"
              >
                <MobileCard
                  variant="tinted"
                  padding="sm"
                  interactive={!isSelected}
                  className={
                    isSelected
                      ? "ring-2 ring-primary bg-primary/10"
                      : ""
                  }
                >
                  <div className="flex flex-col items-center gap-2 py-3">
                    <Icon
                      className={`w-8 h-8 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-body font-bold text-sm ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {interest.label}
                    </span>
                  </div>
                </MobileCard>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="pb-8 pt-6 safe-area-bottom">
        <MobileButton
          variant={isValid ? "primary" : "disabled"}
          fullWidth
          onClick={onComplete}
          disabled={!isValid}
        >
          Continue
        </MobileButton>
      </div>
    </motion.div>
  );
};

export default InterestCaptureStep;
