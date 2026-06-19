import { Suspense } from "react";

import { DatePicker } from "@/components/DatePicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Suspense fallback={null}>
        <DatePicker />
      </Suspense>
      {children}
    </div>
  );
}
