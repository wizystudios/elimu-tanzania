
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
const toast = {
  default: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast(props);
    }
    return sonnerToast(props.title || "", {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  },
  
  success: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.success(props);
    }
    return sonnerToast.success(props.title || "", {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  },
  
  error: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.error(props);
    }
    return sonnerToast.error(props.title || "", {
      description: props.description,
      duration: props.duration || 7000, // Longer duration for errors
      action: props.action,
    });
  },
  
  warning: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.warning(props);
    }
    return sonnerToast.warning(props.title || "", {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  },
  
  info: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.info(props);
    }
    return sonnerToast.info(props.title || "", {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  },
};

// Hook implementation
const useToast = () => {
  return toast;
};

export { useToast, toast };
