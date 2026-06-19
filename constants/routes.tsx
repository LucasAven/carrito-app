import { ReactElement } from "react";
import { ReceiptIcon } from "lucide-react";

export const InternalRoutes = {
  balance: "/balance",
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
];

export enum URL_FILTERS {
  DATE = "date",
  LABEL = "label",
  MONTH = "month",
  PAYMENT_TYPE = "payment_type",
  WEEK = "week",
}
