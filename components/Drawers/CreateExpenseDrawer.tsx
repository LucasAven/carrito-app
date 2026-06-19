/** biome-ignore-all lint/correctness/useUniqueElementIds: here the IDs are unique */
"use client";

import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { AmountInput } from "../AmountInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { PaymentTypeField } from "../PaymentTypeField";
import { DrawerBase } from "./DrawerBase";

import { createExpense } from "@/app/actions/entries";
import { getTodaysDate } from "@/utils";

interface ExpenseFormValues {
	date: string;
	expenseAmount: string;
	expenseName: string;
	paymentType: string;
}

export function CreateExpenseDrawer({ children }: { children: ReactNode }) {
	const [openDrawer, setOpenDrawer] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
	} = useForm<ExpenseFormValues>({
		defaultValues: {
			date: getTodaysDate(),
			expenseAmount: "",
			expenseName: "",
			paymentType: "cash",
		},
	});

	const onSubmit = async (data: ExpenseFormValues) => {
		setSubmitError(null);
		const result = await createExpense({
			amount: data.expenseAmount,
			date: data.date,
			label: data.expenseName,
			paymentType: data.paymentType,
		});

		if (result.error) {
			setSubmitError(result.error);
			return;
		}

		reset();
		setOpenDrawer(false);
	};

	return (
		<DrawerBase
			className="min-h-80"
			open={openDrawer}
			setOpen={setOpenDrawer}
			subtitle="Registrá un egreso"
			title="Nuevo Gasto"
			triggerButton={children}
		>
			<form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
				<InputDate
					acceptFutureDates={false}
					defaultValue={getTodaysDate()}
					error={errors.date}
					name="date"
					register={register}
					setError={setError}
					setValue={setValue}
				/>

				<div>
					<label
						className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
						htmlFor="expense-name"
					>
						Concepto
					</label>
					<input
						className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint w-full rounded-[14px] px-4 py-3.5 text-[15px] font-semibold shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
						id="expense-name"
						placeholder="Gasto en…"
						type="text"
						{...register("expenseName")}
					/>
				</div>

				<div>
					<label
						className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
						htmlFor="expense-amount"
					>
						Monto
					</label>
					<AmountInput
						accent="cost"
						ariaInvalid={!!errors.expenseAmount}
						control={control}
						id="expense-amount"
						name="expenseAmount"
					/>
					<FormError error={errors.expenseAmount} />
				</div>

				<div>
					<p className="text-label dark:text-label-dark mb-2 text-[13px] font-extrabold">
						Forma de pago
					</p>
					<PaymentTypeField
						accent="cost"
						idPrefix="expense-payment"
						name="paymentType"
						register={register}
					/>
					<FormError error={errors.paymentType} />
				</div>

				{submitError && (
					<p className="text-cost text-sm font-semibold">{submitError}</p>
				)}

				<button
					className="bg-cost font-display mt-2 rounded-2xl py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(214,73,46,0.34)] disabled:opacity-60"
					disabled={isSubmitting}
					type="submit"
				>
					{isSubmitting ? "Creando…" : "Crear gasto"}
				</button>
			</form>
		</DrawerBase>
	);
}
