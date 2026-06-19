import { FieldError } from "react-hook-form";

import { cn } from "@/utils/cn";

interface FormErrorProps {
  className?: string;
  error?: FieldError;
}
export const FormError = ({ className = "", error }: FormErrorProps) => {
  console.log("FormErrorProps", error);
  return (
    <p
      aria-atomic="true"
      aria-hidden={!error}
      aria-live="assertive"
      className={cn(
        "pt-1 text-sm text-red-500",
        error ? "block" : "hidden",
        className,
      )}
    >
      {error?.message}
    </p>
  );
};
