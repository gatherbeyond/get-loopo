import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import ProgressIndicator from "@/components/signup/ProgressIndicator";
import AccountCreationStep from "@/components/signup/AccountCreationStep";
import FamilySetupStep from "@/components/signup/FamilySetupStep";
import FamilyCodeDisplayStep from "@/components/signup/FamilyCodeDisplayStep";
import AddKidStep from "@/components/signup/AddKidStep";
import KidCredentialsScreen from "@/components/signup/KidCredentialsScreen";
import CelebrationScreen from "@/components/signup/CelebrationScreen";
import InterestCaptureStep from "@/components/signup/InterestCaptureStep";
import FamilyRewardStep from "@/components/signup/FamilyRewardStep";

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
  kidInterests: string[];
}

const ParentSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginAsParent } = useAuth();
  const initialStep = Number(searchParams.get("step")) || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showKidCredentials, setShowKidCredentials] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFamilyReward, setShowFamilyReward] = useState(false);
  const [familyCode] = useState(generateFamilyCode);
  const [kidPin] = useState(generatePin);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [createdKidId, setCreatedKidId] = useState<string | null>(null);

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
    kidInterests: [],
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

  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleGoogleSignUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://get-loopo.lovable.app'
      }
    });
    if (error) console.error('Google auth error:', error);
  };

  const handleAccountCreate = async () => {
    setSignupError(null);
    setIsSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            role: 'parent'
          }
        }
      });
      if (error) {
        setSignupError(error.message);
        return;
      }

      if (data.session) {
        const { data: family } = await supabase
          .from("families")
          .select("id")
          .eq("parent_id", data.session.user.id)
          .maybeSingle();

        if (family) {
          loginAsParent(signupData.fullName || "Parent", "My Family");
          navigate("/parent");
          return;
        }
      }

      setCurrentStep(2);
    } catch (err: any) {
      setSignupError(err.message || "An unexpected error occurred");
    } finally {
      setIsSigningUp(false);
    }
  };

  const [familySetupError, setFamilySetupError] = useState<string | null>(null);
  const [isSavingFamily, setIsSavingFamily] = useState(false);

  const handleFamilySetupContinue = async () => {
    setFamilySetupError(null);
    setIsSavingFamily(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFamilySetupError("You must be logged in. Please go back and sign up again.");
        return;
      }

      const currencyToCountry: Record<string, string> = {
        PHP: "PH", IDR: "ID", MYR: "MY", THB: "TH", SGD: "SG", VND: "VN", USD: "US",
      };

      const { data: newFamily, error: familyError } = await supabase
        .from("families")
        .insert({
          family_name: signupData.familyName,
          family_code: familyCode,
          parent_id: session.user.id,
          country: currencyToCountry[signupData.currency] || null,
        })
        .select("id")
        .single();

      if (familyError) {
        setFamilySetupError(familyError.message);
        return;
      }

      const { error: creditError } = await supabase
        .from("credit_settings")
        .insert({
          family_id: newFamily.id,
          currency: signupData.currency,
          credits_per_unit: signupData.creditValue,
        });

      if (creditError) {
        setFamilySetupError(creditError.message);
        return;
      }

      setFamilyId(newFamily.id);
      setCurrentStep(3);
    } catch (err: any) {
      setFamilySetupError(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingFamily(false);
    }
  };

  const handleContinue = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const [kidError, setKidError] = useState<string | null>(null);
  const [isSavingKid, setIsSavingKid] = useState(false);

  const handleKidComplete = async () => {
    if (!familyId) {
      setKidError("Family not found. Please go back and try again.");
      return;
    }

    setKidError(null);
    setIsSavingKid(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setKidError("You must be logged in.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("add-kid", {
        body: {
          familyId,
          name: signupData.kidName.trim(),
          age: signupData.kidAge,
          avatar: signupData.kidAvatar,
          pin: kidPin,
        },
      });

      if (error) {
        setKidError(error.message || "Failed to add kid");
        return;
      }

      if (data?.error) {
        setKidError(data.error);
        return;
      }

      if (data?.kid?.id) {
        setCreatedKidId(data.kid.id);
      }

      setShowInterests(true);
    } catch (err: any) {
      setKidError(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingKid(false);
    }
  };

  const handleAddAnother = () => {
    updateData({ kidAvatar: null, kidName: "", kidAge: null });
    setShowKidCredentials(false);
    setKidError(null);
  };

  const handleDone = () => {
    setShowKidCredentials(false);
    setShowFamilyReward(true);
  };

  const handleCelebrationEnd = () => {
    loginAsParent(signupData.fullName || "Parent", signupData.familyName || "My Family");
    navigate("/parent/first-mission");
  };

  if (showCelebration) {
    return <CelebrationScreen onContinue={handleCelebrationEnd} />;
  }

  const totalSteps = 4;
  const displayStep =
    currentStep <= 2
      ? currentStep
      : currentStep === 3
      ? 2
      : showInterests || showKidCredentials
      ? 4
      : 3;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        <ProgressIndicator currentStep={displayStep} totalSteps={4} />

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
                onContinue={handleAccountCreate}
                onBack={handleBack}
                onLogin={() => navigate("/parent-login")}
                onGoogleSignUp={handleGoogleSignUp}
                error={signupError}
                isLoading={isSigningUp}
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
                onContinue={handleFamilySetupContinue}
                onBack={handleBack}
                error={familySetupError}
                isLoading={isSavingFamily}
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

            {currentStep === 4 && !showKidCredentials && !showInterests && !showFamilyReward && (
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
                error={kidError}
                isLoading={isSavingKid}
              />
            )}

            {currentStep === 4 && showInterests && !showKidCredentials && (
              <InterestCaptureStep
                key="interests"
                kidName={signupData.kidName}
                selectedInterests={signupData.kidInterests}
                onUpdate={(interests) => updateData({ kidInterests: interests })}
                onComplete={async () => {
                  if (createdKidId && signupData.kidInterests.length > 0) {
                    await supabase
                      .from("kids")
                      .update({ interests: signupData.kidInterests })
                      .eq("id", createdKidId);
                  }
                  setShowInterests(false);
                  setShowKidCredentials(true);
                }}
                onBack={() => setShowInterests(false)}
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

            {currentStep === 4 && showFamilyReward && !showKidCredentials && (
              <FamilyRewardStep
                key="family-reward"
                kidName={signupData.kidName || "your kid"}
                familyId={familyId || ""}
                onDone={() => {
                  setShowFamilyReward(false);
                  setShowCelebration(true);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ParentSignup;
