import * as React from "react";
import { cn } from "@/lib/utils";

export interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-parent-body font-body font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex w-full h-input-h rounded-2xl border-2 border-input bg-card px-4 py-3",
              "font-body text-kid-body text-foreground",
              "placeholder:text-muted-foreground",
              "transition-all duration-200",
              "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-12",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm font-body text-error animate-slide-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);
MobileInput.displayName = "MobileInput";

export { MobileInput };
