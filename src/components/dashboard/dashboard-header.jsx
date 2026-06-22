"use client";

import { useEffect, useState } from "react";
import client, { handleLogout } from "@/config/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export function DashboardHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await client.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user in header:", error);
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-6">
      <SidebarTrigger />
      <div className="flex-1">
        <h2 className="text-sm font-medium text-muted-foreground">Workspace / Dashboard</h2>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full cursor-pointer hover:bg-muted/10">
            <Avatar className="h-8 w-8 border border-border/40">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-secondary/15 text-secondary font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-surface-container-high border border-muted-foreground/15 text-foreground rounded-xl shadow-xl">
          <DropdownMenuLabel className="font-semibold text-xs py-2 px-3 text-muted-foreground">
            Signed in as 
            <span className="font-bold text-foreground block mt-0.5 truncate">{displayName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-muted-foreground/10" />
          
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted/10 rounded-lg m-1">
            <Link href="/dashboard/billing" className="flex items-center gap-2 w-full">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Billing & Credits
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-muted-foreground/10" />
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg m-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
