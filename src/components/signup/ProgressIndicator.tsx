import React from "react";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex flex-col items-center gap-2 pt-6 safe-area-top">
      <span className="text-xs font-body text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <motion.div
              key={index}
              className={`rounded-full transition-all duration-300 ${
                isActive || isCompleted
                  ? "w-[10px] h-[10px] bg-primary"
                  : "w-2 h-2 bg-border"
              }`}
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.8,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
