import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/signup/ProgressIndicator";
import AccountCreationStep from "@/components/signup/AccountCreationStep";
import FamilySetupStep from "@/components/signup/FamilySetupStep";
import FamilyCodeDisplayStep from "@/components/signup/FamilyCodeDisplayStep";
import AddKidStep from "@/components/signup/AddKidStep";
import KidCredentialsScreen from "@/components/signup/KidCredentialsScreen";
import CelebrationScreen from "@/components/signup/CelebrationScreen";

// Generate a random 6-character family code
const generateFamilyCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// Generate a random 4-digit PIN
const generatePin = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
};

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isOver18: boolean;
  familyPhoto: string | null;
  familyName: string;
  currency: string;
  creditValue: number;
  kidAvatar: string | null;
  kidName: string;
  kidAge: number | null;
}

const ParentSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showKidCredentials, setShowKidCredentials] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [familyCode] = useState(generateFamilyCode);
  const [kidPin] = useState(generatePin);

  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isOver18: false,
    familyPhoto: null,
    familyName: "",
    currency: "PHP",
    creditValue: 100,
    kidAvatar: null,
    kidName: "",
    kidAge: null,
  });

  const updateData = (updates: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...updates }));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleKidComplete = () => {
    setShowKidCredentials(true);
  };

  const handleAddAnother = () => {
    // Reset kid fields for adding another
    updateData({ kidAvatar: null, kidName: "", kidAge: null });
    setShowKidCredentials(false);
    // Stay on step 4 (Add Kid)
  };

  const handleDone = () => {
    setShowKidCredentials(false);
    setShowCelebration(true);
  };

  const handleCelebrationEnd = () => {
    navigate("/parent");
  };

  if (showCelebration) {
    return <CelebrationScreen onContinue={handleCelebrationEnd} />;
  }

  // Total steps: 1=Account, 2=Family Setup, 3=Family Code, 4=Add Kid
  const totalSteps = 4;
  // For the progress indicator, map step 3 (code display) still as part of step 2's completion
  const displayStep = currentStep <= 2 ? currentStep : currentStep === 3 ? 2 : 3;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        <ProgressIndicator currentStep={displayStep} totalSteps={3} />

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <AccountCreationStep
                key="step1"
                data={{
                  fullName: signupData.fullName,
                  email: signupData.email,
                  password: signupData.password,
                  confirmPassword: signupData.confirmPassword,
                  isOver18: signupData.isOver18,
                }}
                onUpdate={(updates) => updateData(updates)}
                onContinue={handleContinue}
                onBack={handleBack}
                onLogin={() => navigate("/")}
              />
            )}

            {currentStep === 2 && (
              <FamilySetupStep
                key="step2"
                data={{
                  familyPhoto: signupData.familyPhoto,
                  familyName: signupData.familyName,
                  currency: signupData.currency,
                  creditValue: signupData.creditValue,
                }}
                onUpdate={(updates) => updateData(updates)}
                onContinue={handleContinue}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <FamilyCodeDisplayStep
                key="step3"
                familyName={signupData.familyName || "Your Family"}
                familyCode={familyCode}
                onContinue={handleContinue}
              />
            )}

            {currentStep === 4 && !showKidCredentials && (
              <AddKidStep
                key="step4"
                data={{
                  avatar: signupData.kidAvatar,
                  name: signupData.kidName,
                  age: signupData.kidAge,
                }}
                onUpdate={(updates) =>
                  updateData({
                    kidAvatar: updates.avatar ?? signupData.kidAvatar,
                    kidName: updates.name ?? signupData.kidName,
                    kidAge: updates.age ?? signupData.kidAge,
                  })
                }
                onComplete={handleKidComplete}
                onBack={handleBack}
              />
            )}

            {currentStep === 4 && showKidCredentials && (
              <KidCredentialsScreen
                key="credentials"
                kidName={signupData.kidName || "Kid"}
                familyCode={familyCode}
                kidPin={kidPin}
                onAddAnother={handleAddAnother}
                onDone={handleDone}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ParentSignup;
