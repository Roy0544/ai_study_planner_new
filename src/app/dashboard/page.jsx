import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StudySetCreator } from "@/components/dashboard/study-set-creator";
import { RecentStudySets } from "@/components/dashboard/recent-study-sets";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { LightRays } from "@/components/ui/light-rays";
import { HyperText } from "@/components/ui/hyper-text";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative bg-background">
        <LightRays
          className="opacity-50"
          color="#60a5fa"
          count={5}
          speed={15}
        />
        {/* <FlickeringGrid
          className="absolute inset-0 z-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white,transparent)]"
          squareSize={4}
          gridGap={6}
          color="#60a5fa"
          maxOpacity={0.2}
          flickerChance={0.1}
        /> */}
        <div className="relative z-10 flex flex-col w-full h-full">
          <DashboardHeader />
          <main className="p-6 space-y-8 max-w-6xl mx-auto w-full flex-1">
            <section className="space-y-6">
              <div className="space-y-2">
                <HyperText 
                  className="text-3xl font-bold tracking-tight text-foreground"
                  as="h1"
                >
                  Welcome back, Alex
                </HyperText>
                <p className="text-muted-foreground">Ready to crush your study goals today?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Sets Created", value: "12", icon: "folder_open" },
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

