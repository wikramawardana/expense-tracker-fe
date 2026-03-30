import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-3 border-foreground placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full bg-background px-3 py-2 text-base font-bold shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,251,245,1)] transition-all outline-none focus:shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] dark:focus:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
