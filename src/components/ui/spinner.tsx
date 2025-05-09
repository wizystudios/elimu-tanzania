
import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-spin rounded-full border-2 border-t-transparent border-gray-300 dark:border-gray-600 h-4 w-4", className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";
