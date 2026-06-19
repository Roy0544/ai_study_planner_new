import { fetchStudySets, getUserProfile } from "@/actions/study-set";
import { StudySetCreator } from "@/components/dashboard/study-set-creator";
import { RecentStudySets } from "@/components/dashboard/recent-study-sets";
import { HyperText } from "@/components/ui/hyper-text";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [setsResult, userResult] = await Promise.all([
    fetchStudySets(),
    getUserProfile(),
  ]);

  const sets = setsResult.success ? setsResult.data : [];
  const user = userResult.success ? userResult.data : null;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Student";

  return (
    <main className="p-6 space-y-8 max-w-6xl mx-auto w-full flex-1">
      <section className="space-y-6">
        <div className="space-y-2">
          <HyperText 
            className="text-3xl font-bold tracking-tight text-foreground"
            as="h1"
          >
            {`Welcome back, ${displayName}`}
          </HyperText>
          <p className="text-muted-foreground">Ready to crush your study goals today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Sets Created", value: sets.length.toString(), icon: "folder_open" },
            { label: "Avg. Score", value: "88%", icon: "star" },
            { label: "This Week", value: "6.5h", icon: "schedule" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm text-muted-foreground">{stat.icon}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>
      </section>

      <StudySetCreator />
      <RecentStudySets />
    </main>
  );
}
