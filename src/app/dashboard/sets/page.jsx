import { fetchStudySets } from "@/actions/study-set";
import StudySetsClient from "./sets-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Your Study Library",
  description: "Review and manage your AI-generated study suites, flashcards, quizzes, and mindmaps.",
};

export default async function StudySetsPage() {
  const result = await fetchStudySets();
  const sets = result.success ? result.data : [];

  return <StudySetsClient initialSets={sets} />;
}
