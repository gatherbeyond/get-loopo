import React from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

const getPasswordStrength = (password: string): { level: "weak" | "medium" | "strong"; percentage: number } => {
  if (!password) return { level: "weak", percentage: 0 };
  
  let score = 0;
  
  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return { level: "weak", percentage: 33 };
  if (score <= 4) return { level: "medium", percentage: 66 };
  return { level: "strong", percentage: 100 };
};

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { level, percentage } = getPasswordStrength(password);
  
  const colorMap = {
    weak: "bg-error",
    medium: "bg-accent-gold",
    strong: "bg-success",
  };
  
  const textColorMap = {
    weak: "text-error",
    medium: "text-accent-gold",
    strong: "text-success",
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1 w-full bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[level]} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-body ${textColorMap[level]} capitalize`}>
        {level}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
