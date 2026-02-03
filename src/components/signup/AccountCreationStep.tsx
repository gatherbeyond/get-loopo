import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { MobileButton, MobileInput } from "@/components/mobile";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

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
}

const AccountCreationStep = ({
  data,
  onUpdate,
  onContinue,
  onBack,
  onLogin,
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

      {/* Form */}
      <div className="flex-1 mt-8 space-y-5">
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
        <MobileButton
          variant={isFormValid ? "primary" : "disabled"}
          fullWidth
          onClick={onContinue}
          disabled={!isFormValid}
        >
          Continue
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
