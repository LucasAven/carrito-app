export const PAYMENT_TYPES = ["cash", "mercado_pago"] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  cash: "Efectivo",
  mercado_pago: "Mercado Pago",
} as const;

export const ENTRY_KINDS = ["sale", "expense"] as const;

export type EntryKind = (typeof ENTRY_KINDS)[number];

type Months =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";
export type MonthFilter = `${Months}-${number}` | "";

export interface BalanceFilters {
  date: string;
  label: string;
  month: MonthFilter;
  paymentTypes: PaymentType[];
  // A custom Operator-picked span, encoded "YYYY-MM-DD_YYYY-MM-DD". Distinct from
  // the bounded week/month/year scopes: it can be any length and span years.
  range: string;
  week: string;
  year: string;
}
