import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-[15px] font-black uppercase tracking-wide transition-all border-2 border-foreground shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "border-foreground bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
        outline:
          "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-foreground/50 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border-transparent text-foreground shadow-none hover:border-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)]",
        link: "text-primary underline-offset-4 hover:underline border-transparent shadow-none dark:shadow-none hover:shadow-none dark:hover:shadow-none hover:translate-x-0 hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 gap-1 px-2.5 text-xs",
        sm: "h-8 gap-1.5 px-3 text-sm",
        lg: "h-10 px-6",
        icon: "size-9",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
