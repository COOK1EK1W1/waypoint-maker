import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 rounded-lg border-2 border-input p-1 m-1",
  {
    variants: {
      variant: {
        default:
          "",
        active:
          "bg-muted",
        destructive:
          "bg-white dark:bg-card text-red-500 hover:bg-red-100 hover:border-red-200",
        red:
          "bg-red-200 border-red-300 dark:bg-red-800 dark:border-red-700",
        amber:
          "bg-amber-200 border-amber-300 dark:bg-amber-700 dark:border-amber-600",
        green:
          "bg-green-200 border-green-300 dark:bg-green-700 dark:border-green-600"
      },
      size: {
        default: "h-9 w-28 px-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onMouseDown={onClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
