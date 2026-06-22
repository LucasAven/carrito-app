import { redirect } from "next/navigation";

import { InternalRoutes } from "@/constants/routes";

// The app has no standalone landing page: the Balance ledger is the home view.
// Unauthenticated visitors are bounced to /login by the middleware before they
// reach here.
export default function Home() {
  redirect(InternalRoutes.balance);
}
