import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.97] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-white/90 shadow-[0_8px_20px_rgba(255,255,255,0.1)]",
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10",
        outline:
          "border border-white/10 bg-transparent shadow-sm hover:bg-white/5 hover:border-white/20 text-white",
        secondary:
          "bg-white/5 text-white border border-white/10 hover:bg-white/10",
        ghost: "text-text-secondary hover:text-white hover:bg-white/5",
        link: "text-accent-cyan underline-offset-4 hover:underline",
        cyan: "bg-accent-cyan text-black hover:bg-cyan-400 shadow-[0_10px_25px_rgba(0,229,255,0.25)]",
        emerald: "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
        glass: "glass-card hover:bg-white/10 border-white/10 text-white",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-3xl px-10 text-base",
        icon: "h-11 w-11",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
