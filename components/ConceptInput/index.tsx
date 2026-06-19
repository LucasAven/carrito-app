import { useId } from "react";
import type {
	FieldValues,
	Path,
	PathValue,
	UseFormRegister,
	UseFormSetValue,
} from "react-hook-form";

interface ConceptInputProps<T extends FieldValues> {
	/** Pre-filled value shown until the user types their own concept. */
	defaultLabel: string;
	name: Path<T>;
	placeholder: string;
	register: UseFormRegister<T>;
	setValue: UseFormSetValue<T>;
}

/**
 * Concept field that stays pre-filled with a sensible default so the user can
 * leave it as-is. Tapping in clears the default to make room for their own
 * wording; leaving it blank restores the default.
 */
export const ConceptInput = <T extends FieldValues>({
	defaultLabel,
	name,
	placeholder,
	register,
	setValue,
}: ConceptInputProps<T>) => {
	const inputId = useId();
	const { onBlur, ...field } = register(name);

	return (
		<div>
			<label
				className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
				htmlFor={inputId}
			>
				Concepto
			</label>
			<input
				className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint w-full rounded-[14px] px-4 py-3.5 text-[15px] font-semibold shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
				id={inputId}
				placeholder={placeholder}
				type="text"
				{...field}
				onBlur={(e) => {
					if (e.target.value.trim() === "") {
						setValue(name, defaultLabel as PathValue<T, Path<T>>);
					}
					onBlur(e);
				}}
				onFocus={(e) => {
					if (e.target.value === defaultLabel) {
						setValue(name, "" as PathValue<T, Path<T>>);
					}
				}}
			/>
		</div>
	);
};
