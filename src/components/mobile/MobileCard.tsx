import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const mobileCardVariants = cva(
  "rounded-2xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card shadow-card",
        elevated: "bg-card shadow-elevated",
        flat: "bg-card border border-border",
        tinted: "bg-background-tint shadow-soft",
        primary: "bg-gradient-primary text-primary-foreground shadow-button",
        gold: "bg-gradient-gold text-accent-gold-foreground shadow-gold",
      },
      padding: {
        none: "",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
      },
      interactive: {
        true: "cursor-pointer active:scale-[0.98] hover:shadow-elevated",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  }
);

export interface MobileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileCardVariants> {}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(mobileCardVariants({ variant, padding, interactive, className }))}
        {...props}
      />
    );
  }
);
MobileCard.displayName = "MobileCard";

const MobileCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-3", className)}
    {...props}
  />
));
MobileCardHeader.displayName = "MobileCardHeader";

const MobileCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-kid-header text-card-foreground", className)}
    {...props}
  />
));
MobileCardTitle.displayName = "MobileCardTitle";

const MobileCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-body text-kid-body", className)} {...props} />
));
MobileCardContent.displayName = "MobileCardContent";

export { MobileCard, MobileCardHeader, MobileCardTitle, MobileCardContent, mobileCardVariants };
