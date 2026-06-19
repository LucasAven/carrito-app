"use client";

import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";

import { cn } from "@/utils/cn";

const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

const formatDigits = (raw: string) => {
	const digits = raw.replace(/\D/g, "");
	if (!digits) return "";
	return formatter.format(Number(digits));
};

interface AmountInputProps<TFieldValues extends FieldValues> {
	accent?: "earn" | "cost";
	ariaInvalid?: boolean;
	control: Control<TFieldValues>;
	id: string;
	name: FieldPath<TFieldValues>;
}

export function AmountInput<TFieldValues extends FieldValues>({
	accent = "earn",
	ariaInvalid,
	control,
	id,
	name,
}: AmountInputProps<TFieldValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onBlur, onChange, ref, value } }) => (
				<div className="bg-surface dark:bg-surface-dark flex items-center gap-2 rounded-[14px] px-4 py-3 shadow-[0_1px_4px_rgba(58,42,34,0.05)]">
					<span
						className={cn(
							"font-display text-[22px] font-bold",
							accent === "cost" ? "text-cost" : "text-earn",
						)}
					>
						$
					</span>
					<input
						aria-invalid={ariaInvalid ? "true" : "false"}
						className="font-display text-ink dark:text-ink-dark placeholder:text-faint w-full bg-transparent text-[22px] font-bold outline-none"
						id={id}
						inputMode="numeric"
						onBlur={onBlur}
						onChange={(event) => {
							const digits = event.target.value.replace(/\D/g, "");
							onChange(digits);
						}}
						placeholder="0"
						ref={ref}
						type="text"
						value={formatDigits(String(value ?? ""))}
					/>
				</div>
			)}
			rules={{ required: "Campo Requerido" }}
		/>
	);
}
