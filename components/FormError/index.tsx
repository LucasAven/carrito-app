import type { FieldError } from "react-hook-form";

import { cn } from "@/utils/cn";

interface FormErrorProps {
	className?: string;
	error?: FieldError;
}
export const FormError = ({ className = "", error }: FormErrorProps) => {
	return (
		<p
			aria-atomic="true"
			aria-hidden={!error}
			aria-live="assertive"
			className={cn(
				"text-cost pt-1 text-sm font-semibold",
				error ? "block" : "hidden",
				className,
			)}
		>
			{error?.message}
		</p>
	);
};
