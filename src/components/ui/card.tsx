import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ========================
// Card Variants
// ========================

const cardVariants = cva(
  "w-full max-w-flex bg-white rounded-2xl shadow-[0_6px_0_#e5e7eb] p-5",
  {
    variants: {
      variant: {
        default: "",

        // Elevated / Important
        important: `
          border-2 border-border
          bg-gradient-to-b from-[#f2f5ff] to-white
        `,

        // Statistic
        stat: `
          flex flex-col gap-1
        `,

        // Empty State
        empty: `
          text-center
        `,

        // Split Comparison
        split: `
          pb-6
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

// ========================
// Header (Eyebrow)
// ========================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[14px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// ========================
// Title
// ========================

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "default" | "achievement"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses =
    size === "achievement"
      ? "text-[20px] font-bold"
      : "text-[18px] font-semibold"

  return (
    <h3
      ref={ref}
      className={cn(sizeClasses, "mb-2", className)}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

// ========================
// Content Wrapper
// ========================

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

// ========================
// Description (Muted)
// ========================

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground mb-4", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// ========================
// Statistic Number
// ========================

const CardStatNumber = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[34px] font-bold leading-[1.05]",
      className
    )}
    {...props}
  />
))
CardStatNumber.displayName = "CardStatNumber"

// ========================
// Statistic Meta
// ========================

const CardStatMeta = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardStatMeta.displayName = "CardStatMeta"

// ========================
// Split Layout
// ========================

const CardSplit = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-[1fr_auto_1fr] items-center mt-4",
      className
    )}
    {...props}
  />
))
CardSplit.displayName = "CardSplit"

const CardSplitDivider = () => (
  <div className="w-[2px] h-12 bg-border justify-self-center rounded-sm" />
)

const CardSplitSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-center", className)}
    {...props}
  />
))
CardSplitSection.displayName = "CardSplitSection"

const CardSplitValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[26px] font-bold leading-[1.1]",
      className
    )}
    {...props}
  />
))
CardSplitValue.displayName = "CardSplitValue"

const CardSplitLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[13px] text-muted-foreground mt-1",
      className
    )}
    {...props}
  />
))
CardSplitLabel.displayName = "CardSplitLabel"

// ========================
// Display Block (Friend Code)
// ========================

const CardDisplayBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-[#eef1ff] rounded-xl px-4 py-[16px] font-bold tracking-[0.08em] flex justify-between items-center",
      className
    )}
    {...props}
  />
))
CardDisplayBlock.displayName = "CardDisplayBlock"

const CardDisplayActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-3 text-[13px] font-semibold text-muted-foreground",
      className
    )}
    {...props}
  />
))
CardDisplayActions.displayName = "CardDisplayActions"

// ========================
// Export
// ========================

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardStatNumber,
  CardStatMeta,
  CardSplit,
  CardSplitDivider,
  CardSplitSection,
  CardSplitValue,
  CardSplitLabel,
  CardDisplayBlock,
  CardDisplayActions,
}
