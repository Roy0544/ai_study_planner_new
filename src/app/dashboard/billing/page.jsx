import BillingClient from "./billing-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Billing & Credits",
  description: "Manage your GKVK AI credits, purchase additional generation packages, view invoice logs, and redeem promo codes.",
};

export default function BillingPage() {
  return <BillingClient />;
}
