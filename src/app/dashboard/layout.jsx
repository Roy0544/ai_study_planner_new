import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="relative bg-background">
          <div className="relative z-10 flex flex-col w-full h-full min-h-screen">
            <DashboardHeader />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
