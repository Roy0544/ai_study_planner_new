"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BorderBeam } from "@/components/ui/border-beam";
import { AuroraText } from "@/components/ui/aurora-text";
import { CreditsWidget } from "@/components/dashboard/credits-widget";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import client, { handleLogout } from "@/config/client";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Library, 
  Share2, 
  CreditCard, 
  MoreVertical, 
  LogOut 
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const [user, setUser] = useState(null);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await client.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user in sidebar:", error);
      }
    }
    fetchUser();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Student";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "ST";

  const isCollapsed = state === "collapsed";

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      tooltip: "Dashboard",
    },
    {
      href: "/dashboard/sets",
      label: "Study Sets",
      icon: Library,
      tooltip: "Study Sets",
    },
    {
      href: "/dashboard/share",
      label: "Notes & Papers",
      icon: Share2,
      tooltip: "Notes & Papers",
    },
    {
      href: "/dashboard/billing",
      label: "Billing & Credits",
      icon: CreditCard,
      tooltip: "Billing & Credits",
    },
  ];

  return (
    <Sidebar variant="inset" className="border-r border-app-border/40 bg-slate-950/40 backdrop-blur-xl transition-all duration-300">
      <SidebarHeader className="p-6 group-data-[state=collapsed]:p-3 transition-all duration-300">
        <Link 
          href="/dashboard" 
          onClick={handleLinkClick} 
          className="flex items-center gap-3 px-2 group group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-md border border-app-border/80 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.jpg"
              alt="GKVK AI Logo"
              width={40}
              height={40}
              priority
              className="h-full w-full object-cover"
            />
            {/* Elegant rotating beam around the logo */}
            <BorderBeam size={20} duration={4} borderWidth={1.5} colorFrom="#60A5FA" colorTo="#8B5CF6" />
          </div>
          <div className="flex flex-col group-data-[state=collapsed]:hidden transition-all duration-300">
            <span className="text-lg font-bold leading-none tracking-tight">
              <AuroraText colors={["#60A5FA", "#8B5CF6", "#38BDF8", "#60A5FA"]} speed={0.8}>
                GKVK_AI
              </AuroraText>
            </span>
            <span className="text-[10px] text-text-muted mt-1.5 font-medium tracking-wider uppercase flex items-center gap-1.5">
              v1.0.4 Beta
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-app-border/30 to-transparent mx-4 mb-4" />
      
      <SidebarContent className="px-4 group-data-[state=collapsed]:px-2 mt-2 transition-all duration-300">
        <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-text-muted uppercase group-data-[state=collapsed]:hidden">
          Workspace
        </div>
        <SidebarMenu className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href} className="relative">
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-orange-500 shadow-[0_0_8px_#f97316] z-20 transition-all duration-300" />
                )}
                
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.tooltip}
                  className={cn(
                    "h-11 rounded-xl text-text-secondary transition-all duration-200 cursor-pointer group/menu-btn border border-transparent",
                    "hover:text-orange-500 hover:bg-orange-500/5 hover:border-orange-500/5",
                    "data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-500/10 data-[active=true]:to-transparent data-[active=true]:text-orange-500 data-[active=true]:border-orange-500/10"
                  )}
                >
                  <Link href={item.href} onClick={handleLinkClick} className="flex items-center w-full">
                    <Icon className="mr-2.5 h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover/menu-btn:scale-110" />
                    <span className="font-medium transition-transform duration-200 group-hover/menu-btn:translate-x-0.5">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[state=collapsed]:p-2 space-y-4 mb-4 transition-all duration-300">
        {/* Credits Widget */}
        <CreditsWidget />

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-app-border/30 to-transparent mx-2 my-2 group-data-[state=collapsed]:hidden" />

        {/* User Profile Widget */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 p-2.5 w-full text-left rounded-xl transition-all cursor-pointer group/profile relative",
                "bg-app-card/20 hover:bg-app-card/75 border border-app-border/30 hover:border-app-border/60",
                "group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:border-0 group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:mx-auto"
              )}>
                {/* Hover gradient background overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-app-brand/5 to-indigo-500/5 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300 pointer-events-none group-data-[state=collapsed]:hidden" />
                
                <Avatar className="h-9 w-9 border border-app-border/80 group-hover/profile:border-app-brand/80 transition-colors shadow-sm shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-app-brand/10 text-app-brand font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col flex-1 min-w-0 group-data-[state=collapsed]:hidden z-10">
                  <span className="text-xs font-bold text-text-primary truncate leading-none">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-text-muted truncate leading-none mt-1.5">
                    {user.email}
                  </span>
                </div>

                <MoreVertical className="text-text-muted h-[18px] w-[18px] group-data-[state=collapsed]:hidden group-hover/profile:text-text-secondary transition-colors z-10 ml-auto shrink-0" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              side={isMobile ? "bottom" : "right"} 
              align={isCollapsed ? "center" : "end"} 
              className="w-56 bg-app-card border border-app-border text-text-primary rounded-xl shadow-lg p-1.5 ml-2"
            >
              <DropdownMenuLabel className="font-semibold text-xs py-2 px-3 text-muted-foreground">
                Account Details
                <span className="font-bold text-foreground block mt-0.5 truncate">{displayName}</span>
                <span className="font-normal text-[10px] text-muted-foreground/80 block mt-0.5 truncate">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted-foreground/10 mx-1.5" />
              
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 rounded-lg py-2 px-3 flex items-center gap-2">
                <Link href="/dashboard/billing" className="flex items-center gap-2 w-full">
                  <CreditCard className="h-[18px] w-[18px] shrink-0" />
                  Billing & Credits
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-muted-foreground/10 mx-1.5" />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg py-2 px-3 flex items-center gap-2"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
