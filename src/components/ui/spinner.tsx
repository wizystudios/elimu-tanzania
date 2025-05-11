
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-t-transparent", "h-4 w-4", className)}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
