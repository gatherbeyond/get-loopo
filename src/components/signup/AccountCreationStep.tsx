import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isEmailValid = validateEmail(data.email);
  const passwordsMatch = data.password === data.confirmPassword && data.confirmPassword.length > 0;
  const isPasswordStrong = data.password.length >= 8;

  const isFormValid =
    data.fullName.trim().length > 0 &&
    isEmailValid &&
    isPasswordStrong &&
    passwordsMatch &&
    data.isOver18;

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
          Create Your Account
        </h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          You must be 18+ to create a parent account
        </p>
      </div>

      {/* Google Sign Up */}
      {onGoogleSignUp && (
        <>
          <button
            onClick={onGoogleSignUp}
            className="w-full h-[52px] bg-card border border-border rounded-xl flex items-center justify-center gap-3 shadow-soft mt-6"
          >
            <GoogleLogo />
            <span className="text-base font-body text-muted-foreground">Sign up with Google</span>
          </button>

          <div className="flex items-center gap-3 mt-4 mb-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-body text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      {/* Form */}
      <div className="flex-1 mt-4 space-y-5">
        {/* Full Name */}
        <MobileInput
          label="Full Name"
          placeholder="Enter your full name"
          value={data.fullName}
          onChange={(e) => onUpdate({ fullName: e.target.value })}
          onBlur={() => setTouched({ ...touched, fullName: true })}
          error={touched.fullName && !data.fullName.trim() ? "Name is required" : undefined}
        />

        {/* Email */}
        <div className="relative">
          <MobileInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            onBlur={() => setTouched({ ...touched, email: true })}
            error={touched.email && data.email && !isEmailValid ? "Please enter a valid email address" : undefined}
            icon={
              data.email && isEmailValid ? (
                <Check className="w-5 h-5 text-success" />
              ) : touched.email && data.email && !isEmailValid ? (
                <AlertCircle className="w-5 h-5 text-error" />
              ) : undefined
            }
          />
        </div>

        {/* Password */}
        <div>
          <MobileInput
            label="Create Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={data.password}
            onChange={(e) => onUpdate({ password: e.target.value })}
            onBlur={() => setTouched({ ...touched, password: true })}
            error={touched.password && data.password && !isPasswordStrong ? "Password must be at least 8 characters" : undefined}
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

        {/* Confirm Password */}
        <MobileInput
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={data.confirmPassword}
          onChange={(e) => onUpdate({ confirmPassword: e.target.value })}
          onBlur={() => setTouched({ ...touched, confirmPassword: true })}
          error={
            touched.confirmPassword && data.confirmPassword && !passwordsMatch
              ? "Passwords do not match"
              : undefined
          }
          icon={
            data.confirmPassword && passwordsMatch ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-primary" />
                ) : (
                  <Eye className="w-5 h-5 text-primary" />
                )}
              </button>
            )
          }
        />

        {/* Age Verification Checkbox */}
        <div className="pt-4">
          <label className="flex items-center gap-3 h-11 cursor-pointer">
            <button
              type="button"
              onClick={() => onUpdate({ isOver18: !data.isOver18 })}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                data.isOver18
                  ? "bg-primary border-primary"
                  : "border-border bg-transparent"
              }`}
            >
              {data.isOver18 && <Check className="w-4 h-4 text-primary-foreground" />}
            </button>
            <span className="text-base font-body font-bold text-foreground">
              I am 18 years or older <span className="text-error">*</span>
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-8 pt-6 safe-area-bottom">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-body text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          </div>
        )}
        <MobileButton
          variant={isFormValid && !isLoading ? "primary" : "disabled"}
          fullWidth
          onClick={onContinue}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </MobileButton>

        <p className="text-center mt-4 text-sm font-body text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={onLogin}
            className="text-primary font-semibold"
          >
            Log In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default AccountCreationStep;
