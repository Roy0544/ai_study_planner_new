import SharingHubClient from "./share-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Notes & Papers Sharing Hub",
  description: "Collaboratively crowdsource verified lecture notes, exam papers, syllabus guides, and lab records for GKVK scholars.",
};

export default function SharePage() {
  return <SharingHubClient />;
}
