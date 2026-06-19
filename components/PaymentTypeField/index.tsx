"use client";

import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormRegister,
} from "react-hook-form";

import { PAYMENT_TYPE_LABELS, PAYMENT_TYPES } from "@/types/balance";
import { cn } from "@/utils/cn";

interface PaymentTypeFieldProps<T extends FieldValues> {
	accent?: "earn" | "cost";
	idPrefix: string;
	name: Path<T>;
	register: UseFormRegister<T>;
}

export function PaymentTypeField<T extends FieldValues>({
	accent = "earn",
	idPrefix,
	name,
	register,
}: PaymentTypeFieldProps<T>) {
	const checkedClass =
		accent === "cost"
			? "peer-checked:bg-cost peer-checked:shadow-[0_4px_10px_rgba(214,73,46,0.28)]"
			: "peer-checked:bg-earn peer-checked:shadow-[0_4px_10px_rgba(31,157,107,0.28)]";

	return (
		<div className="grid grid-cols-2 gap-2.5">
			{PAYMENT_TYPES.map((type) => {
				const id = `${idPrefix}-${type}`;
				return (
					<label key={type} className="cursor-pointer" htmlFor={id}>
						<input
							className="peer sr-only"
							id={id}
							type="radio"
							value={type}
							{...register(name, {
								required: "Campo Requerido",
							} as RegisterOptions<T, Path<T>>)}
						/>
						<span
							className={cn(
								"border-line dark:border-line-dark bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark block rounded-[14px] border-2 py-3.5 text-center text-[14.5px] font-extrabold peer-checked:border-transparent peer-checked:text-white",
								checkedClass,
							)}
						>
							{PAYMENT_TYPE_LABELS[type]}
						</span>
					</label>
				);
			})}
		</div>
	);
}
