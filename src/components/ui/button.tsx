import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ========================
// Button Variants
// ========================
const buttonVariants = cva(
  [
    // Base behaviour
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-[650] cursor-pointer select-none",
    "transition-[transform,box-shadow,background,border-color] duration-100 ease-out",

    // Accessibility
    "focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(81,126,254,0.35)] focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-busy:pointer-events-none aria-busy:opacity-80",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "bg-[#517efe]",
          "border-2 border-[#4971eb]",
          "shadow-[0_4px_0_#4971eb]",
          "hover:bg-[#4f7af5]",
          "active:translate-y-[3px]",
          "active:shadow-[0_1px_0_#4971eb]",
        ].join(" "),

        secondary: [
          "bg-white text-black",
          "border-2 border-[#e5e7eb]",
          "active:border-[#d1d5db]",
        ].join(" "),

        optional: [
          "bg-[#f7f9ff] text-black",
          "border-2 border-dotted border-[#e5e7eb]",
          "hover:bg-[#eef2ff]",
          "focus-visible:border-solid focus-visible:bg-white",
        ].join(" "),

        destructive: [
          "bg-white",
          "border-2 border-[#ef4444]",
          "text-[#dc2626]",
          "hover:bg-[#fff5f5]",
          "active:border-[#dc2626]",
        ].join(" "),

        link: [
          "p-0 bg-transparent border-none",
          "text-[#4971eb] font-semibold text-[0.9rem]",
          "hover:underline hover:text-[#3b5bdc]",
          "active:text-[#2f4bc4]",
          "disabled:no-underline",
        ].join(" "),
      },

      size: {
        sm: "px-[1.4rem] py-[0.45rem] text-[0.85rem] rounded-[10px]",
        md: "px-[1.3rem] py-[0.9rem] text-[0.95rem] rounded-[12px]",
        lg: "px-[1rem] py-[1.25rem] text-[1rem] rounded-[16px]",
        icon: "h-12 w-12 p-0 text-[1.25rem] rounded-[14px]",
      },

      block: {
        true: "w-full",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
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
  (
    {
      className,
      variant,
      size,
      block,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
