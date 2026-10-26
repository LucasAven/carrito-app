"use client";

import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { CheckIcon } from "lucide-react";

interface ExtraordinaryFieldProps<T extends FieldValues> {
	id: string;
	name: Path<T>;
	register: UseFormRegister<T>;
}

/**
 * Marks an Expense as a "Gasto extraordinario": a sporadic spend the Operator
 * tracks but which stays out of every money figure the app shows (see
 * CONTEXT.md and ADR-0011).
 */
export function ExtraordinaryField<T extends FieldValues>({
	id,
	name,
	register,
}: ExtraordinaryFieldProps<T>) {
	return (
		<label
			className="bg-surface dark:bg-surface-dark flex cursor-pointer items-center gap-3 rounded-[14px] px-4 py-3.5 shadow-[0_1px_4px_rgba(58,42,34,0.05)]"
			htmlFor={id}
		>
			<input
				className="peer sr-only"
				id={id}
				type="checkbox"
				{...register(name)}
			/>
			{/* The tick is always in the box and only becomes visible when checked,
			    so the whole state change rides sibling selectors off the input. */}
			<span className="border-line dark:border-line-dark peer-checked:bg-cost flex size-5.5 shrink-0 items-center justify-center rounded-md border-2 text-transparent peer-checked:border-transparent peer-checked:text-white">
				<CheckIcon size={14} strokeWidth={3.5} />
			</span>
			<span className="text-ink dark:text-ink-dark text-[15px] font-semibold">
				Gasto extraordinario
			</span>
		</label>
	);
}
