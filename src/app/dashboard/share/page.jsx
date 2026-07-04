import SharingHubClient from "./share-client";
import { getUserProfile } from "@/actions/study-set";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Notes & Papers Sharing Hub",
  description: "Collaboratively crowdsource verified lecture notes, exam papers, syllabus guides, and lab records for GKVK scholars.",
};

export default async function SharePage() {
  const userResult = await getUserProfile();
  if (!userResult.success || !userResult.data) {
    redirect("/login");
  }

  return <SharingHubClient />;
}
