import { Suspense } from "react";

import { DatePicker } from "@/components/DatePicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Full-height flex column: the DatePicker stays pinned at the top while the
    // page below (Balance card + scrollable entry list) fills the rest.
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <DatePicker />
      </Suspense>
      {children}
    </div>
  );
}
