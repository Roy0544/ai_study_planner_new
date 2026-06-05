import { fetchStudySets } from "@/actions/study-set";
import { StudySetCard } from "@/components/dashboard/study-set-card";
import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function StudySetsPage() {
  const result = await fetchStudySets();
  const sets = result.success ? result.data : [];

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full flex-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <HyperText 
            className="text-3xl font-bold tracking-tight text-foreground"
            as="h1"
          >
            Your Study Library
          </HyperText>
          <p className="text-muted-foreground">Manage and review your AI-generated study suites.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">search</span>
            <Input 
              placeholder="Search library..." 
              className="pl-9 bg-muted/30 border-muted-foreground/10 rounded-xl h-10"
            />
          </div>
          <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20 shrink-0">
            <Link href="/dashboard">
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Create New
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid Section */}
      {sets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {sets.map((set) => (
            <StudySetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground/50">folder_open</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No study sets yet</h3>
            <p className="text-muted-foreground  mx-auto text-sm">
              Start by creating your first AI-powered study set from your notes or files.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl font-bold mt-4">
            <Link href="/dashboard">
              Get Started
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
