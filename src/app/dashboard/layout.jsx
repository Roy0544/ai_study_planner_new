import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LightRays } from "@/components/ui/light-rays";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="relative bg-background">
          <LightRays
            className="opacity-50"
            color="#60a5fa"
            count={5}
            speed={15}
          />
          <div className="relative z-10 flex flex-col w-full h-full min-h-screen">
            <DashboardHeader />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
