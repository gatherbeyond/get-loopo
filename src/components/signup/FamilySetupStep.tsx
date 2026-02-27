import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Info, ChevronDown, Coins } from "lucide-react";
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

const currencies = [
  { code: "PHP", name: "Philippine Peso" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "THB", name: "Thai Baht" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "USD", name: "United States Dollar" },
];

const creditPresets = [50, 100, 200];

const FamilySetupStep = ({
  data,
  onUpdate,
  onContinue,
  onBack,
  error,
  isLoading,
}: FamilySetupStepProps) => {
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isFormValid = data.familyName.trim().length > 0;
  const charCount = data.familyName.length;

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onUpdate({ familyPhoto: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

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
          Set Up Your Family
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          This helps us personalize your experience
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 mt-8 space-y-8">
        {/* Family Photo Upload */}
        <div className="flex flex-col items-center">
          <button
            onClick={handlePhotoUpload}
            className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-primary bg-background-tint flex flex-col items-center justify-center gap-2 overflow-hidden"
          >
            {data.familyPhoto ? (
              <img
                src={data.familyPhoto}
                alt="Family"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera className="w-8 h-8 text-primary" />
                <span className="text-sm font-body text-muted-foreground">
                  Add Photo
                </span>
              </>
            )}
          </button>
          <button
            onClick={() => onUpdate({ familyPhoto: null })}
            className="mt-2 text-sm font-body text-muted-foreground"
          >
            {data.familyPhoto ? "Change Photo" : "Skip for now"}
          </button>
        </div>

        {/* Family Name */}
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
        </div>

        {/* Credit Conversion Setup */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-body font-bold text-muted-foreground">
              Set Your Credit Value
            </span>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="relative"
            >
              <Info className="w-4 h-4 text-primary" />
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-6 w-48 p-3 bg-card rounded-xl shadow-elevated z-10 border-l-4 border-primary"
                >
                  <p className="text-xs font-body text-muted-foreground">
                    Most families use 100 credits = 1 {data.currency}
                  </p>
                </motion.div>
              )}
            </button>
          </div>

          {/* Explanation Card */}
          <div className="bg-background-tint rounded-2xl p-4 border border-primary/20 flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-body text-muted-foreground">
              This helps kids understand money. You can change this later.
            </p>
          </div>

          {/* Credit Input Display */}
          <div className="bg-background-tint rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl font-display font-bold text-foreground">1</span>
              
              <button
                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="flex items-center gap-1 text-xl font-display font-bold text-primary"
              >
                {data.currency}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <span className="text-xl font-display font-bold text-foreground">=</span>
              
              <input
                type="number"
                value={data.creditValue}
                onChange={(e) => onUpdate({ creditValue: parseInt(e.target.value) || 0 })}
                className="w-20 text-center text-2xl font-display font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
              />
              
              <div className="flex items-center gap-1">
                <Coins className="w-6 h-6 text-accent-gold" />
                <span className="text-lg font-body text-muted-foreground">credits</span>
              </div>
            </div>
          </div>

          {/* Currency Picker Dropdown */}
          {showCurrencyPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-card rounded-2xl shadow-elevated overflow-hidden"
            >
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    onUpdate({ currency: currency.code });
                    setShowCurrencyPicker(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex justify-between items-center ${
                    data.currency === currency.code
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  <span className="font-body font-semibold">{currency.code}</span>
                  <span className="text-sm font-body text-muted-foreground">
                    {currency.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Suggested Values */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {creditPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => onUpdate({ creditValue: preset })}
                className={`px-5 py-2 rounded-full border-2 text-sm font-body font-semibold transition-all ${
                  data.creditValue === preset
                    ? "border-primary bg-background-tint text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {preset} credits
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-8 pt-6 safe-area-bottom">
        {error && (
          <p className="text-destructive text-sm font-body text-center mb-3">{error}</p>
        )}
        <button
          onClick={onBack}
          className="w-full text-center text-primary font-body font-semibold mb-4"
        >
          Back
        </button>
        
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
