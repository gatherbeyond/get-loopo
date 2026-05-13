import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Lock, User } from "lucide-react";
import { MobileButton, MobileInput } from "@/components/mobile";
import AvatarPicker, { avatars } from "./AvatarPicker";
import loopoMascot from "@/assets/loopo-mascot.png";

interface AddKidData {
  avatar: string | null;
  name: string;
  age: number | null;
}

interface AddKidStepProps {
  data: AddKidData;
  onUpdate: (data: Partial<AddKidData>) => void;
  onComplete: () => void;
  onBack: () => void;
  error?: string | null;
  isLoading?: boolean;
}

const ageOptions = [8, 9, 10, 11, 12, 13, 14];

const AddKidStep = ({
  data,
  onUpdate,
  onComplete,
  onBack,
  error,
  isLoading,
}: AddKidStepProps) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);

  const isFormValid = data.avatar && data.name.trim().length > 0 && data.age !== null;

  const selectedAvatarData = avatars.find((a) => a.id === data.avatar);

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
          Add Your First Kid
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          You can add more kids later
        </p>
      </div>

      {/* Mascot */}
      <div className="flex justify-center mt-4">
        <motion.img
          src={loopoMascot}
          alt="Loopo mascot"
          className="h-20 w-auto object-contain"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Form */}
      <div className="flex-1 mt-6 space-y-6">
        {/* Avatar Selection */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className={`w-[120px] h-[120px] rounded-full flex items-center justify-center text-5xl ${
              selectedAvatarData
                ? `${selectedAvatarData.bg} ring-[3px] ring-primary`
                : "bg-muted border-2 border-dashed border-border"
            }`}
          >
            {selectedAvatarData ? (
              selectedAvatarData.emoji
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-center text-sm font-body text-muted-foreground">
          Tap to choose avatar
        </p>

        {/* Kid Name */}
        <MobileInput
          label="Kid's Name"
          placeholder="Enter kid's name"
          value={data.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <p className="text-xs font-body text-muted-foreground -mt-4">
          e.g., Miguel, Sofia, Alex
        </p>

        {/* Age Selector */}
        <div>
          <label className="block text-sm font-body text-muted-foreground mb-2">
            Age
          </label>
          <button
            onClick={() => setShowAgePicker(!showAgePicker)}
            className="w-full h-[52px] px-4 border-2 border-border rounded-2xl flex items-center justify-between bg-card"
          >
            <span
              className={`text-base font-body ${
                data.age ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {data.age ? `${data.age} years old` : "Select age (8-14)"}
            </span>
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
          
          {/* Age Picker Dropdown */}
          {showAgePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-card rounded-2xl shadow-elevated overflow-hidden"
            >
              {ageOptions.map((age) => (
                <button
                  key={age}
                  onClick={() => {
                    onUpdate({ age });
                    setShowAgePicker(false);
                  }}
                  className={`w-full px-4 py-3 text-left font-body ${
                    data.age === age
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground"
                  }`}
                >
                  {age} years old
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-background-tint rounded-xl px-4 py-3 border border-primary/20 flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-xs font-body text-muted-foreground">
            We're COPPA compliant and kid-safe 🔒
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-8 pt-6 safe-area-bottom">
        {error && (
          <p className="text-sm font-body text-error text-center mb-3">{error}</p>
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
          onClick={onComplete}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </MobileButton>
      </div>

      {/* Avatar Picker Bottom Sheet */}
      <AvatarPicker
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={(avatar) => onUpdate({ avatar })}
        selectedAvatar={data.avatar}
      />
    </motion.div>
  );
};

export default AddKidStep;
