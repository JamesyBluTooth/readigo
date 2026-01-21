import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ========================
// Button Variants
// ========================
const buttonVariants = cva(
  // Base button — shared behaviour & structure
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md cursor-pointer select-none whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 transition-[transform,box-shadow] duration-100 ease-out",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white border-2 border-[#4971eb] shadow-[0_4px_0_#4971e5] active:translate-y-[4px] active:shadow-none",

        secondary:
          "bg-white text-text border-2 border-border shadow-none text-[#898b8d]",

        optional:
          "bg-[var(--bg)] text-text border-2 border-dotted border-border shadow-none",
      },
      size: {
        default: "px-[1.1rem] py-[1.1rem] text-[1.05rem]",
        sm: "px-[0.7rem] py-[0.7rem] w-1/4 text-[0.95rem]",
        lg: "px-[2rem] py-[1.1rem] text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
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
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
