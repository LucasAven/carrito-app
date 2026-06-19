"use client";

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

const formatDigits = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return formatter.format(Number(digits));
};

interface AmountInputProps<TFieldValues extends FieldValues> {
  ariaInvalid?: boolean;
  control: Control<TFieldValues>;
  id: string;
  name: FieldPath<TFieldValues>;
}

export function AmountInput<TFieldValues extends FieldValues>({
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
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            $
          </span>
          <input
            aria-invalid={ariaInvalid ? "true" : "false"}
            className="w-full pl-7"
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
