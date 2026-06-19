"use client";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { AmountInput } from "../AmountInput";
import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { DrawerBase } from "./DrawerBase";

import { createSale } from "@/app/actions/entries";
import { getTodaysDate } from "@/utils";

interface SaleFormValues {
  date: string;
  paymentType: string;
  saleAmount: string;
  saleName: string;
}

export function CreateBalanceDrawer({ children }: { children: ReactNode }) {
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
  } = useForm<SaleFormValues>({
    defaultValues: {
      date: getTodaysDate(),
      paymentType: "cash",
      saleAmount: "",
      saleName: "",
    },
  });

  const onSubmit = async (data: SaleFormValues) => {
    setSubmitError(null);
    const result = await createSale({
      amount: data.saleAmount,
      date: data.date,
      label: data.saleName,
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
      title="Nueva Venta"
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
          <label htmlFor="sale-name">
            <strong>Concepto: </strong>
          </label>
          <input
            id="sale-name"
            placeholder="Venta"
            type="text"
            {...register("saleName")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sale-amount">
            <strong>Monto: </strong>
          </label>
          <AmountInput
            ariaInvalid={!!errors.saleAmount}
            control={control}
            id="sale-amount"
            name="saleAmount"
          />
          <FormError error={errors.saleAmount} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="payment-type">
            <strong>Forma de pago: </strong>
          </label>
          <fieldset className="flex justify-center gap-4" id="payment-type">
            <div className="flex gap-2">
              <input
                id="cash"
                type="radio"
                value="cash"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="cash">Efectivo</label>
            </div>
            <div className="flex gap-2">
              <input
                id="mp"
                type="radio"
                value="mercado_pago"
                {...register("paymentType", { required: "Campo Requerido" })}
              />
              <label htmlFor="mp">Mercado Pago</label>
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
