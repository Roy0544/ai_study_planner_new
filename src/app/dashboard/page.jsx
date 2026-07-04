import { fetchStudySets, getUserProfile } from "@/actions/study-set";
import { getUserCredits, getUserTransactions } from "@/actions/billing";
import DashboardClient from "./dashboard-client";
import { RecentStudySets } from "@/components/dashboard/recent-study-sets";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard",
  description: "Your GKVK AI study dashboard. Generate study suites, check statistics, and access learning files.",
};

export default async function DashboardPage() {
  const userResult = await getUserProfile();
  if (!userResult.success || !userResult.data) {
    redirect("/login");
  }

  const user = userResult.data;
  const [setsResult, creditsResult, txResult] = await Promise.all([
    fetchStudySets(),
    getUserCredits(),
    getUserTransactions(),
  ]);

  const sets = setsResult.success ? setsResult.data : [];
  const credits = creditsResult.success ? (creditsResult.data?.credits || 0) : 0;
  const transactions = txResult.success ? txResult.data : [];
  const assetsGenerated = transactions.filter(tx => tx.amount < 0).length;

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Student";

  return (
    <DashboardClient 
      sets={sets}
      credits={credits}
      assetsGenerated={assetsGenerated}
      displayName={displayName}
      recentStudySets={<RecentStudySets />}
    />
  );
}
