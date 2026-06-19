export const PAYMENT_TYPES = ["cash", "mercado_pago"] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  cash: "Efectivo",
  mercado_pago: "Mercado Pago",
} as const;

interface FinancialEntry {
  hour: string;
  label: string;
  type: PaymentType;
  value: number;
}

export interface FinancialData {
  date: string;
  earnings: FinancialEntry[];
  expenses: FinancialEntry[];
}

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
  week: string;
}
