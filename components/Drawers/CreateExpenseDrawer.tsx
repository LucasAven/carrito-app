/** biome-ignore-all lint/correctness/useUniqueElementIds: here the IDs are unique */
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

import { AmountInput } from "../AmountInput";
import { ConceptInput } from "../ConceptInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { PaymentTypeField } from "../PaymentTypeField";
import { DrawerBase } from "./DrawerBase";

import { createExpense } from "@/app/actions/entries";
import { getFiltersFromSearchParams, getTodaysDate } from "@/utils";

const DEFAULT_EXPENSE_NAME = "Gasto";

interface ExpenseFormValues {
	date: string;
	expenseAmount: string;
	expenseName: string;
	paymentType: string;
}

export function CreateExpenseDrawer({ children }: { children: ReactNode }) {
	const [openDrawer, setOpenDrawer] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// New entries default to the day the Operator is looking at (retroactive entry
	// is the normal workflow). In week/month view there is no single day, so the
	// filter helper leaves `date` empty and we fall back to today.
	const searchParams = useSearchParams();
	const selectedDate =
		getFiltersFromSearchParams(new URLSearchParams(searchParams.toString()))
			.date || getTodaysDate();

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
			date: selectedDate,
			expenseAmount: "",
			expenseName: DEFAULT_EXPENSE_NAME,
			paymentType: "cash",
		},
	});

	// Re-seed a fresh form (with the currently-viewed date) each time the drawer
	// opens, so the date follows navigation and stale half-entries don't linger.
	useEffect(() => {
		if (openDrawer) {
			reset({
				date: selectedDate,
				expenseAmount: "",
				expenseName: DEFAULT_EXPENSE_NAME,
				paymentType: "cash",
			});
		}
	}, [openDrawer, selectedDate, reset]);

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
					defaultValue={selectedDate}
					error={errors.date}
					name="date"
					register={register}
					setError={setError}
					setValue={setValue}
				/>

				<ConceptInput
					defaultLabel={DEFAULT_EXPENSE_NAME}
					name="expenseName"
					placeholder="Gasto en…"
					register={register}
					setValue={setValue}
				/>

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
