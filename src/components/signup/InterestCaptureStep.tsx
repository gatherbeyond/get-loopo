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
  Blocks,
  Swords,
  Tv2,
  Music4,
  Scissors,
  Shirt,
  FlaskConical,
  Video,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react";
import { MobileButton } from "@/components/mobile";

interface InterestCaptureStepProps {
  kidName: string;
  selectedInterests: string[];
  onUpdate: (interests: string[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

const interests = [
  { label: "Gaming", icon: Gamepad2 },
  { label: "Roblox", icon: Blocks },
  { label: "Mobile Legends", icon: Swords },
  { label: "Sports", icon: Trophy },
  { label: "Fitness", icon: Dumbbell },
  { label: "Outdoors", icon: TreePine },
  { label: "Art", icon: Palette },
  { label: "Crafts", icon: Scissors },
  { label: "Music", icon: Music },
  { label: "Dance", icon: Music4 },
  { label: "Movies", icon: Film },
  { label: "Anime", icon: Tv2 },
  { label: "Books", icon: BookOpen },
  { label: "Science", icon: FlaskConical },
  { label: "Tech", icon: Cpu },
  { label: "Vlogging", icon: Video },
  { label: "Cooking", icon: ChefHat },
  { label: "Food", icon: UtensilsCrossed },
  { label: "Pets", icon: PawPrint },
  { label: "Fashion", icon: Shirt },
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
          Pick at least 2 — you can always add more later
        </p>
      </div>

      {/* Interest Pills */}
      <div className="flex-1 mt-8">
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.label);
            const Icon = interest.icon;

            return (
              <motion.button
                key={interest.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest.label)}
                className={`inline-flex items-center rounded-full px-4 py-2 border-2 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-primary border-primary"
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                <span className="font-body font-semibold text-sm">
                  {interest.label}
                </span>
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
