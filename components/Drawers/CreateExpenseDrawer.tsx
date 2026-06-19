"use client";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { AmountInput } from "../AmountInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
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
      title="Nuevo Gasto"
      triggerButton={children}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <InputDate
          acceptFutureDates={false}
          className="gap-2"
          defaultValue={getTodaysDate()}
          error={errors.date}
          name="date"
          register={register}
          setError={setError}
          setValue={setValue}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="expense-name">
            <strong>Concepto: </strong>
          </label>
          <input
            id="expense-name"
            placeholder="Gasto"
            type="text"
            {...register("expenseName")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="expense-amount">
            <strong>Monto: </strong>
          </label>
          <AmountInput
            ariaInvalid={!!errors.expenseAmount}
            control={control}
            id="expense-amount"
            name="expenseAmount"
          />
          <FormError error={errors.expenseAmount} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="payment-type">
            <strong>Forma de pago: </strong>
          </label>
          <fieldset className="flex justify-center gap-4" id="payment-type">
            <div className="flex gap-2">
              <input
                id="expense-cash"
                type="radio"
                value="cash"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="expense-cash">Efectivo</label>
            </div>
            <div className="flex gap-2">
              <input
                id="expense-mp"
                type="radio"
                value="mercado_pago"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="expense-mp">Mercado Pago</label>
            </div>
          </fieldset>
          <FormError error={errors.paymentType} />
        </div>

        {submitError && <p className="text-sm text-cost">{submitError}</p>}

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creando…" : "Crear"}
        </button>
      </form>
    </DrawerBase>
  );
}
