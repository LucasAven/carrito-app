/** biome-ignore-all lint/correctness/useUniqueElementIds: here the IDs are unique */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2Icon } from "lucide-react";

import { AmountInput } from "../AmountInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { PaymentTypeField } from "../PaymentTypeField";
import { DrawerBase } from "./DrawerBase";

import { updateEntry } from "@/app/actions/entries";
import type { Entry } from "@/lib/db/entries";
import { cn } from "@/utils/cn";

interface EditEntryDrawerProps {
	entry: Entry | null;
	onClose: () => void;
	onDelete: (entry: Entry) => void;
}

interface EntryFormValues {
	amount: string;
	date: string;
	label: string;
	paymentType: string;
}

export function EditEntryDrawer({
	entry,
	onClose,
	onDelete,
}: EditEntryDrawerProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
	} = useForm<EntryFormValues>({
		defaultValues: {
			amount: "",
			date: "",
			label: "",
			paymentType: "",
		},
	});

	useEffect(() => {
		if (!entry) return;
		reset({
			amount: String(entry.amount),
			date: entry.occurred_on,
			label: entry.label,
			paymentType: entry.payment,
		});
		setSubmitError(null);
	}, [entry, reset]);

	const onSubmit = async (data: EntryFormValues) => {
		if (!entry) return;
		setSubmitError(null);
		const result = await updateEntry(entry.id, {
			amount: data.amount,
			date: data.date,
			label: data.label,
			paymentType: data.paymentType,
		});

		if (result.error) {
			setSubmitError(result.error);
			return;
		}

		onClose();
	};

	// The parent owns deletion so it can drop the row optimistically and surface
	// the undo toast; the drawer just signals intent and gets closed from above.
	const handleDelete = () => {
		if (!entry) return;
		onDelete(entry);
	};

	const isOpen = entry !== null;
	const isExpense = entry?.kind === "expense";
	const title = isExpense ? "Editar Gasto" : "Editar Venta";
	const accent = isExpense ? "cost" : "earn";

	return (
		<DrawerBase
			className="min-h-80"
			open={isOpen}
			setOpen={(open) => {
				if (!open) onClose();
			}}
			subtitle="Modificá o eliminá"
			title={title}
			triggerButton={null}
		>
			<form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
				<InputDate
					acceptFutureDates={false}
					defaultValue={entry?.occurred_on}
					error={errors.date}
					name="date"
					register={register}
					setError={setError}
					setValue={setValue}
				/>

				<div>
					<label
						className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
						htmlFor="edit-label"
					>
						Concepto
					</label>
					<input
						aria-invalid={errors.label ? "true" : "false"}
						className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint w-full rounded-[14px] px-4 py-3.5 text-[15px] font-semibold shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
						id="edit-label"
						type="text"
						{...register("label", { required: "Campo Requerido" })}
					/>
					<FormError error={errors.label} />
				</div>

				<div>
					<label
						className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
						htmlFor="edit-amount"
					>
						Monto
					</label>
					<AmountInput
						accent={accent}
						ariaInvalid={!!errors.amount}
						control={control}
						id="edit-amount"
						name="amount"
					/>
					<FormError error={errors.amount} />
				</div>

				<div>
					<p className="text-label dark:text-label-dark mb-2 text-[13px] font-extrabold">
						Forma de pago
					</p>
					<PaymentTypeField
						accent={accent}
						idPrefix="edit-payment"
						name="paymentType"
						register={register}
					/>
					<FormError error={errors.paymentType} />
				</div>

				{submitError && (
					<p className="text-cost text-sm font-semibold">{submitError}</p>
				)}

				<div className="mt-2 flex gap-2.5">
					<button
						className="border-line dark:border-line-dark bg-surface dark:bg-surface-dark font-display text-cost flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 py-4 text-base font-bold disabled:opacity-60"
						disabled={isSubmitting}
						onClick={handleDelete}
						type="button"
					>
						<Trash2Icon size={17} />
						Eliminar
					</button>

					<button
						className={cn(
							"font-display flex-[1.4] rounded-2xl py-4 text-[17px] font-bold text-white disabled:opacity-60",
							accent === "cost"
								? "bg-cost shadow-[0_8px_20px_rgba(214,73,46,0.34)]"
								: "bg-earn shadow-[0_8px_20px_rgba(31,157,107,0.34)]",
						)}
						disabled={isSubmitting}
						type="submit"
					>
						{isSubmitting ? "Guardando…" : "Guardar"}
					</button>
				</div>
			</form>
		</DrawerBase>
	);
}
