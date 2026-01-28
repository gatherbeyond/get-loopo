import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 touch-target",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 active:opacity-80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary-hover active:bg-secondary-hover",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        ghost:
          "text-primary hover:bg-primary/10 active:bg-primary/20",
        success:
          "bg-gradient-success text-success-foreground shadow-soft hover:opacity-90",
        gold:
          "bg-gradient-gold text-accent-gold-foreground shadow-gold hover:opacity-90",
        disabled:
          "bg-muted text-muted-foreground cursor-not-allowed",
      },
      size: {
        default: "h-button-h px-8 text-kid-button rounded-3xl",
        sm: "h-12 px-6 text-base rounded-2xl",
        lg: "h-16 px-10 text-xl rounded-3xl",
        icon: "h-12 w-12 rounded-full",
        iconLg: "h-14 w-14 rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
MobileButton.displayName = "MobileButton";

export { MobileButton, mobileButtonVariants };
