"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AmountInput } from "../AmountInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { DrawerBase } from "./DrawerBase";

import { deleteEntry, updateEntry } from "@/app/actions/entries";
import { Entry } from "@/lib/db/entries";

interface EditEntryDrawerProps {
  entry: Entry | null;
  onClose: () => void;
}

interface EntryFormValues {
  amount: string;
  date: string;
  label: string;
  paymentType: string;
}

export function EditEntryDrawer({ entry, onClose }: EditEntryDrawerProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const onDelete = async () => {
    if (!entry) return;
    const confirmMessage =
      entry.kind === "expense"
        ? "¿Eliminar este gasto?"
        : "¿Eliminar esta venta?";
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    setSubmitError(null);
    const result = await deleteEntry(entry.id);
    if (result.error) {
      setSubmitError(result.error);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    onClose();
  };

  const isOpen = entry !== null;
  const title = entry?.kind === "expense" ? "Editar Gasto" : "Editar Venta";

  return (
    <DrawerBase
      className="min-h-80"
      open={isOpen}
      setOpen={(open) => {
        if (!open) onClose();
      }}
      title={title}
      triggerButton={null}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <InputDate
          acceptFutureDates={false}
          className="gap-2"
          defaultValue={entry?.occurred_on}
          error={errors.date}
          name="date"
          register={register}
          setError={setError}
          setValue={setValue}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-label">
            <strong>Concepto: </strong>
          </label>
          <input
            aria-invalid={errors.label ? "true" : "false"}
            id="edit-label"
            type="text"
            {...register("label", { required: "Campo Requerido" })}
          />
          <FormError error={errors.label} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-amount">
            <strong>Monto: </strong>
          </label>
          <AmountInput
            ariaInvalid={!!errors.amount}
            control={control}
            id="edit-amount"
            name="amount"
          />
          <FormError error={errors.amount} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-payment-type">
            <strong>Forma de pago: </strong>
          </label>
          <fieldset
            className="flex justify-center gap-4"
            id="edit-payment-type"
          >
            <div className="flex gap-2">
              <input
                id="edit-cash"
                type="radio"
                value="cash"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="edit-cash">Efectivo</label>
            </div>
            <div className="flex gap-2">
              <input
                id="edit-mp"
                type="radio"
                value="mercado_pago"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="edit-mp">Mercado Pago</label>
            </div>
          </fieldset>
          <FormError error={errors.paymentType} />
        </div>

        {submitError && <p className="text-sm text-cost">{submitError}</p>}

        <button disabled={isSubmitting || deleting} type="submit">
          {isSubmitting ? "Guardando…" : "Guardar"}
        </button>

        <button
          className="mt-4 rounded-md bg-cost px-3 py-2 font-semibold text-white disabled:opacity-50"
          disabled={isSubmitting || deleting}
          onClick={onDelete}
          type="button"
        >
          {deleting ? "Eliminando…" : "Eliminar"}
        </button>
      </form>
    </DrawerBase>
  );
}
