import { ReactElement } from "react";
import { ChartColumnIcon, ReceiptIcon } from "lucide-react";

export const InternalRoutes = {
  balance: "/balance",
  stats: "/stats",
} as const;

export const InternalRoutesData: {
  href: (typeof InternalRoutes)[keyof typeof InternalRoutes];
  icon: ReactElement;
  label: string;
}[] = [
  {
    href: `/balance`,
    icon: <ReceiptIcon className="stroke-current" size={20} />,
    label: "Balance",
  },
  {
    href: `/stats`,
    icon: <ChartColumnIcon className="stroke-current" size={20} />,
    label: "Resumen",
  },
];

export enum URL_FILTERS {
  DATE = "date",
  LABEL = "label",
  MONTH = "month",
  PAYMENT_TYPE = "payment_type",
  WEEK = "week",
  YEAR = "year",
}
