import BillingClient from "./billing-client";
import { getUserProfile } from "@/actions/study-set";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Billing & Credits",
  description: "Manage your GKVK AI credits, purchase additional generation packages, view invoice logs, and redeem promo codes.",
};

export default async function BillingPage() {
  const userResult = await getUserProfile();
  if (!userResult.success || !userResult.data) {
    redirect("/login");
  }

  return <BillingClient />;
}
