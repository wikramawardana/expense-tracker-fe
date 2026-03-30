import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-secondary selection:text-foreground border-3 border-foreground h-10 w-full min-w-0 bg-background px-3 py-2 text-base font-bold shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-black disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] focus:translate-x-[-1px] focus:translate-y-[-1px]",
        "dark:shadow-[3px_3px_0px_0px_rgba(255,251,245,1)] dark:focus:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
