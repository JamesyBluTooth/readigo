import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ========================
// Button Variants
// ========================
const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-bold rounded-md focus:outline-none disabled:pointer-events-none disabled:opacity-50 transition-none", // no easing
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-[0_6px_0_#4971e5] active:translate-y-[3px] active:shadow-[0_2px_0_#4971e5]",
        secondary:
          "bg-white border border-input text-black hover:bg-accent hover:text-accent-foreground shadow-none",
      },
      size: {
        default: "px-[1.1rem] py-[1.1rem] text-[1.05rem]",
        sm: "px-[0.7rem] py-[0.7rem] w-1/4 inline-flex gap-2 text-[0.95rem]",
        lg: "px-[2rem] py-[1.1rem] text-lg",
        icon: "h-10 w-10", // icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ========================
// Button Props
// ========================
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// ========================
// Button Component
// ========================
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
