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
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  CreditCard, 
  LogOut, 
  Bell, 
  HelpCircle, 
  Coins, 
  Sparkles, 
  Gift 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getUserTransactions } from "@/actions/billing";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  
  // Transaction Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

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

  const handleOpenTransactions = async () => {
    setIsOpen(true);
    setLoadingTx(true);
    try {
      const res = await getUserTransactions();
      if (res.success) {
        const sortedTx = (res.data || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setTransactions(sortedTx);
      }
    } catch (error) {
      console.error("Failed to fetch transactions in header:", error);
    } finally {
      setLoadingTx(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      if (path === "dashboard") label = "Dashboard";
      else if (path === "sets") label = "Study Sets";
      else if (path === "share") label = "Notes & Papers";
      else if (path === "billing") label = "Billing & Credits";
      else if (path === "workspace") label = "Workspace";

      const isLast = index === paths.length - 1;

      return {
        label,
        href,
        isLast,
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-app-border/40 bg-slate-950/40 backdrop-blur-xl px-6 transition-all duration-300">
        
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-app-border/30 transition-all cursor-pointer" />
        </div>

        <div className="h-4 w-[1px] bg-app-border/40" />

        {/* Dynamic Breadcrumbs */}
        <div className="flex-1 flex items-center gap-1.5 text-xs text-text-secondary select-none">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3 w-3 text-text-muted shrink-0" />}
              {crumb.isLast ? (
                <span className="font-semibold text-text-primary text-[13px]">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.href} 
                  className="hover:text-text-primary transition-colors text-[13px] font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Help Circle Button */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl cursor-pointer hover:bg-slate-800/60 hover:text-text-primary text-text-secondary border border-transparent hover:border-app-border/30 transition-all" asChild>
            <Link href="/terms" title="Help & Docs">
              <HelpCircle className="h-[18px] w-[18px]" />
            </Link>
          </Button>

          {/* Recent Transactions Button (previously notification button) */}
          <button 
            onClick={handleOpenTransactions}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl cursor-pointer hover:bg-slate-800/60 hover:text-text-primary text-text-secondary border border-transparent hover:border-app-border/30 transition-all"
            title="Recent Activity & Transactions"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-slate-950 animate-pulse" />
          </button>

          <div className="h-4 w-[1px] bg-app-border/40 mx-1" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 p-0 rounded-xl cursor-pointer hover:bg-slate-800/40 border border-transparent hover:border-app-border/30 transition-all flex items-center gap-2 group px-1.5">
                <Avatar className="h-8 w-8 border border-app-border group-hover:border-app-brand/60 transition-colors shadow-sm shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-app-brand/10 text-app-brand font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors pr-1 hidden sm:inline-block">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 bg-app-card border border-app-border text-text-primary rounded-xl shadow-lg p-1.5 mt-2">
              <DropdownMenuLabel className="font-semibold text-xs py-2 px-3 text-muted-foreground">
                Signed in as 
                <span className="font-bold text-foreground block mt-0.5 truncate">{displayName}</span>
                <span className="font-normal text-[10px] text-muted-foreground/80 block mt-0.5 truncate">{user?.email}</span>
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

        </div>
      </header>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] md:w-[500px] !max-w-none bg-surface border border-muted-foreground/15 text-foreground rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="flex flex-col space-y-1.5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-app-brand/10 text-app-brand border border-app-brand/20">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Recent Activity</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Your last 5 credits adjustments and purchases.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="my-4 space-y-2.5">
            {loadingTx ? (
              /* Loader skeleton */
              <div className="space-y-3.5 py-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-9 w-9 rounded-xl bg-slate-800/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
                      <div className="h-2 w-1/2 bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-3 w-10 bg-slate-800/60 rounded" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/30 flex items-center justify-center text-text-muted">
                  <Coins className="h-6 w-6 opacity-45" />
                </div>
                <p className="text-xs text-text-secondary font-medium">No recent transactions found.</p>
              </div>
            ) : (
              <div className="divide-y divide-app-border/15 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  
                  // Choose icon based on transaction type
                  let IconComponent = Sparkles;
                  let bgClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  
                  if (tx.type === "purchase") {
                    IconComponent = CreditCard;
                    bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  } else if (tx.type === "bonus") {
                    IconComponent = Gift;
                    bgClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                  }

                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 group/tx">
                      <div className={cn("h-9.5 w-9.5 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover/tx:scale-105", bgClass)}>
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary break-words whitespace-normal" title={tx.description}>
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono mt-1">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                      <div className={cn(
                        "text-xs font-extrabold font-mono shrink-0",
                        isPositive ? "text-emerald-400" : "text-text-muted"
                      )}>
                        {isPositive ? `+${tx.amount}` : tx.amount} cr
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-app-border/15 pt-4 flex gap-2 w-full justify-between items-center sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto font-semibold rounded-xl text-xs border border-app-border/40 hover:bg-white/5 cursor-pointer h-9"
            >
              Close
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto font-bold rounded-xl text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 cursor-pointer h-9"
            >
              <Link href="/dashboard/billing" onClick={() => setIsOpen(false)}>
                View Billing Details
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
