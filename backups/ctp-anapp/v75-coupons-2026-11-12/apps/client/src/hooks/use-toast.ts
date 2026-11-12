import { toast as sonnerToast } from "sonner";

type LegacyToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant = "default" }: LegacyToastInput) {
  const message = title || description || "Notificação";
  const options = title && description ? { description } : undefined;
  if (variant === "destructive") {
    return sonnerToast.error(message, options);
  }
  return sonnerToast.success(message, options);
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },
  };
}

export { toast };
