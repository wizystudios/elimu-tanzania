
import { toast as sonnerToast } from "sonner";

// Define the toast type
type ToastType = "default" | "success" | "error" | "warning" | "info";

// Define props for toast function
interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
  action?: React.ReactNode;
}

// Create a wrapper around sonner toast to provide consistent styling
const toast = (props: ToastProps | string) => {
  if (typeof props === "string") {
    return sonnerToast(props);
  }
  
  const { title, description, variant = "default", duration = 5000, action } = props;
  
  switch (variant) {
    case "success":
      return sonnerToast.success(title || "", {
        description,
        duration,
        action,
      });
    case "error":
    case "destructive":
      return sonnerToast.error(title || "", {
        description,
        duration: duration || 7000, // Longer duration for errors
        action,
      });
    case "warning":
      return sonnerToast.warning(title || "", {
        description,
        duration,
        action,
      });
    case "info":
      return sonnerToast.info(title || "", {
        description,
        duration,
        action,
      });
    default:
      return sonnerToast(title || "", {
        description,
        duration,
        action,
      });
  }
};

// Hook implementation that returns both the toast function and an empty toasts array for compatibility
const useToast = () => {
  return {
    toast,
    toasts: [], // Empty array for compatibility with Toaster component
  };
};

export { useToast, toast };
