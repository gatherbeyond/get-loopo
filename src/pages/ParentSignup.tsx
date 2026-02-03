import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/signup/ProgressIndicator";
import AccountCreationStep from "@/components/signup/AccountCreationStep";
import FamilySetupStep from "@/components/signup/FamilySetupStep";
import AddKidStep from "@/components/signup/AddKidStep";
import CelebrationScreen from "@/components/signup/CelebrationScreen";

interface SignupData {
  // Step 1: Account Creation
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isOver18: boolean;
  // Step 2: Family Setup
  familyPhoto: string | null;
  familyName: string;
  currency: string;
  creditValue: number;
  // Step 3: Add Kid
  kidAvatar: string | null;
  kidName: string;
  kidAge: number | null;
}

const ParentSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [signupData, setSignupData] = useState<SignupData>({
    // Step 1
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isOver18: false,
    // Step 2
    familyPhoto: null,
    familyName: "",
    currency: "PHP",
    creditValue: 100,
    // Step 3
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

  const handleComplete = () => {
    setShowCelebration(true);
  };

  const handleCelebrationEnd = () => {
    // Navigate to parent dashboard or home
    navigate("/home");
  };

  if (showCelebration) {
    return <CelebrationScreen onContinue={handleCelebrationEnd} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />
      
      {/* Mobile Frame */}
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        {/* Step Content */}
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
              <AddKidStep
                key="step3"
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
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ParentSignup;
