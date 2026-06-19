"use client";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "../FormError";
import { InputDate } from "../InputDate";
import { DrawerBase } from "./DrawerBase";

// TODO: add create balance mutation (currently submit button does nothing)
export function CreateBalanceDrawer({ children }: { children: ReactNode }) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      date: "",
      paymentType: "",
      saleAmount: "",
      saleName: "",
    },
  });

  const onSubmit = (data: {
    date: string;
    paymentType: string;
    saleAmount: string;
    saleName: string;
  }) => {
    console.log(data);
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
            aria-invalid={errors.saleName ? "true" : "false"}
            id="sale-name"
            placeholder="Venta de..."
            type="text"
            {...register("saleName", { required: "Campo Requerido" })}
          />
          <FormError error={errors.saleName} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sale-amount">
            <strong>Monto: </strong>
          </label>
          <input
            aria-invalid={errors.saleAmount ? "true" : "false"}
            id="sale-amount"
            placeholder="0"
            step="0.01"
            type="number"
            {...register("saleAmount", {
              required: "Campo Requerido",
            })}
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
        <button type="submit">Crear</button>
      </form>
    </DrawerBase>
  );
}
