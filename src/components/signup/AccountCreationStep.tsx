import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, AlertCircle, ShieldCheck, Ban, Heart } from "lucide-react";
import { toast } from "sonner";
import { MobileButton, MobileInput } from "@/components/mobile";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AppleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 814 1000" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.9 0 663.4 0 540.8 0 345.5 134.4 240.5 265.7 240.5c70.8 0 129.9 41.7 174 41.7 42.2 0 108.8-43.6 186.6-43.6 30.5 0 110.5 3.8 166.1 83.2zm-109.3-256c31.7-36.5 54.3-87 54.3-137.5 0-7.2-.6-14.5-1.9-20.8-51.5 2-112.8 34.3-149.7 72.8-28.5 31.2-56 81.7-56 132.8 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 46.5 0 104.8-31.2 137.8-67.8z"/>
  </svg>
);

interface AccountCreationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isOver18: boolean;
}

interface AccountCreationStepProps {
  data: AccountCreationData;
  onUpdate: (data: Partial<AccountCreationData>) => void;
  onContinue: () => void;
  onBack: () => void;
  onLogin: () => void;
  onGoogleSignUp?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

const AccountCreationStep = ({
  data,
  onUpdate,
  onContinue,
  onBack,
  onLogin,
  onGoogleSignUp,
  error,
  isLoading,
}: AccountCreationStepProps) => {
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const isPasswordStrong = data.password.length >= 8;

  return (
    <AnimatePresence mode="wait">
      {step === "email" ? (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col min-h-full px-5"
        >
          <div className="pt-6">
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
          </div>

          <h1 className="text-[28px] font-display font-bold text-foreground mt-4">
            Let's get started
          </h1>
          <p className="text-sm font-body text-muted-foreground mt-1">
            Takes 30 seconds. No card needed.
          </p>

          <button
            onClick={() => toast("Apple Sign-In coming soon")}
            className="w-full h-[52px] bg-card border border-border rounded-xl flex items-center justify-center gap-3 shadow-soft mt-6 opacity-60 cursor-not-allowed"
          >
            <AppleLogo />
            <span className="text-base font-body text-muted-foreground">Continue with Apple</span>
          </button>

          {onGoogleSignUp && (
            <button
              onClick={onGoogleSignUp}
              className="w-full h-[52px] bg-card border border-border rounded-xl flex items-center justify-center gap-3 shadow-soft mt-3"
            >
              <GoogleLogo />
              <span className="text-base font-body text-muted-foreground">Sign up with Google</span>
            </button>
          )}

          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-body text-muted-foreground">OR EMAIL</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-2">
            <MobileInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
            />
          </div>

          <div className="mt-6">
            <MobileButton
              variant={isEmailValid ? "primary" : "disabled"}
              fullWidth
              onClick={() => setStep("password")}
              disabled={!isEmailValid}
            >
              Continue →
            </MobileButton>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-body text-muted-foreground">COPPA Safe</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-body text-muted-foreground">No Ads</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-body text-muted-foreground">SEA-built</span>
            </span>
          </div>

          <p className="mt-3 text-center text-[11px] font-body text-muted-foreground px-4">
            By continuing, you confirm you're 18+ and agree to our Terms & Privacy Policy. We never sell your family's data.
          </p>

          <div className="flex-1 min-h-[24px]" />

          <p className="pb-8 safe-area-bottom text-center text-sm font-body text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-primary font-semibold">
              Log In
            </button>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="password"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col min-h-full px-5"
        >
          <div className="pt-6">
            <button
              onClick={() => setStep("email")}
              className="w-11 h-11 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
          </div>

          <h1 className="text-[28px] font-display font-bold text-foreground mt-4">
            Create a password
          </h1>
          <p className="text-sm font-body text-muted-foreground mt-1">
            You'll use this to log back in
          </p>

          <div className="mt-8">
            <MobileInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={data.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-primary" />
                  ) : (
                    <Eye className="w-5 h-5 text-primary" />
                  )}
                </button>
              }
            />
            <PasswordStrengthMeter password={data.password} />
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-body text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            </div>
          )}

          <div className="mt-6">
            <MobileButton
              variant={isPasswordStrong && !isLoading ? "primary" : "disabled"}
              fullWidth
              onClick={onContinue}
              disabled={!isPasswordStrong || isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account →"}
            </MobileButton>
          </div>

          <div className="mt-auto pb-8 safe-area-bottom" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountCreationStep;
