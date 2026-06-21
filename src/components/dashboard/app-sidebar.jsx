"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { CreditsWidget } from "@/components/dashboard/credits-widget";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight">GKVK_AI</span>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium tracking-wider uppercase">v1.0.4 Beta</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 mt-4">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard" className="h-11 rounded-xl data-[active=true]:bg-secondary/10 data-[active=true]:text-[#8B5CF6] hover:text-secondary hover:bg-secondary/5 transition-all">
              <Link href="/dashboard">
                <span className="material-symbols-outlined mr-2">space_dashboard</span>
                <span className="font-medium">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard/sets"} tooltip="Study Sets" className="h-11 rounded-xl data-[active=true]:bg-secondary/10 data-[active=true]:text-[#8B5CF6] hover:text-secondary hover:bg-secondary/5 transition-all">
              <Link href="/dashboard/sets">
                <span className="material-symbols-outlined mr-2">folder_copy</span>
                <span className="font-medium">Study Sets</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard/billing"} tooltip="Billing" className="h-11 rounded-xl data-[active=true]:bg-secondary/10 data-[active=true]:text-[#8B5CF6] hover:text-secondary hover:bg-secondary/5 transition-all">
              <Link href="/dashboard/billing">
                <span className="material-symbols-outlined mr-2">payments</span>
                <span className="font-medium">Billing & Credits</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4 mb-4">


        {/* Credits Widget */}
        <CreditsWidget />
      </SidebarFooter>
    </Sidebar>
  );
}
