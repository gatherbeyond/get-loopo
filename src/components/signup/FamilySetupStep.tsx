import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileButton, MobileInput } from "@/components/mobile";

interface FamilySetupData {
  familyPhoto: string | null;
  familyName: string;
  currency: string;
  creditValue: number;
}

interface FamilySetupStepProps {
  data: FamilySetupData;
  onUpdate: (data: Partial<FamilySetupData>) => void;
  onContinue: () => void;
  onBack: () => void;
  error?: string | null;
  isLoading?: boolean;
}

const FamilySetupStep = ({
  data,
  onUpdate,
  onContinue,
  onBack,
  error,
  isLoading,
}: FamilySetupStepProps) => {
  const isFormValid = data.familyName.trim().length > 0;
  const charCount = data.familyName.length;

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
          What's your family called?
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          This is how you'll appear across Loopo
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 mt-8">
        <div>
          <MobileInput
            label="Family Name"
            placeholder="The Santos Family"
            value={data.familyName}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                onUpdate({ familyName: e.target.value });
              }
            }}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs font-body text-muted-foreground">
              e.g., The Smiths, The Lee Family
            </span>
            <span className="text-xs font-body text-muted-foreground">
              {charCount}/30
            </span>
          </div>
          <p className="text-xs font-body text-muted-foreground text-center mt-3">
            Credit value and currency can be adjusted in Settings after signup
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-8 pt-6 safe-area-bottom">
        {error && (
          <p className="text-destructive text-sm font-body text-center mb-3">{error}</p>
        )}
        <MobileButton
          variant={isFormValid && !isLoading ? "primary" : "disabled"}
          fullWidth
          onClick={onContinue}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Saving..." : "Continue"}
        </MobileButton>
      </div>
    </motion.div>
  );
};

export default FamilySetupStep;
