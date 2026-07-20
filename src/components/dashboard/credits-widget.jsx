"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserCredits } from "@/actions/billing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import client from "@/config/client";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Coins, ExternalLink, Plus } from "lucide-react";

export function CreditsWidget() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    const result = await getUserCredits();
    if (result.success) {
      setCredits(result.data.credits);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCredits();
    
    // Listen to Supabase auth state changes (e.g. when OAuth session is established)
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchCredits();
        router.refresh();
      }
    });

    const handleSync = (e) => {
      if (e.detail !== undefined) {
        setCredits(e.detail);
      } else {
        fetchCredits();
      }
    };

    window.addEventListener("credits-updated", handleSync);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("credits-updated", handleSync);
    };
  }, [fetchCredits, router]);

  const handlePurchaseSuccess = (newCredits) => {
    setCredits(newCredits);
  };

  const isLow = credits !== null && credits < 5;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard/billing"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-[0.95] mx-auto border",
              isLow 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" 
                : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
            )}
          >
            <Coins className="h-[20px] w-[20px] animate-pulse" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex flex-col gap-1 p-1">
            <span className="font-bold text-[11px] text-text-primary">Credits Balance</span>
            <span className={cn("text-[10px] font-bold", isLow ? "text-amber-400" : "text-orange-400")}>
              {loading ? "..." : `${credits ?? 0} left`}
            </span>
            <span className="text-[9px] text-text-muted mt-0.5">Click to buy more</span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-app-card/40 backdrop-blur-md border border-app-border/60 space-y-3.5 transition-all hover:border-app-border hover:bg-app-card/60">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/billing"
          className="text-[10px] font-bold text-text-secondary hover:text-app-brand uppercase tracking-wider transition-colors flex items-center gap-1 group"
        >
          Credits Balance
          <ExternalLink className="h-[10px] w-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
        <div className="flex items-center gap-1">
          <Coins className={cn("h-[14px] w-[14px] animate-pulse", isLow ? "text-amber-400" : "text-orange-400")} />
          <span className="text-[10px] font-bold text-text-primary">
            {loading ? "..." : `${credits ?? 0} left`}
          </span>
        </div>
      </div>

      {/* Credits progress bar */}
      <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden p-[2px] border border-app-border/20">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
            isLow ? "from-amber-600 to-amber-400 shadow-[0_0_8px_#f59e0b]" : "from-orange-600 to-orange-400 shadow-[0_0_8px_#f97316]"
          )}
          style={{ width: `${Math.min(((credits ?? 0) / 100) * 100, 100)}%` }}
        />
      </div>

      <Button
        size="sm"
        asChild
        className={cn(
          "w-full h-8 text-[11px] font-bold rounded-xl transition-all border-none !text-white cursor-pointer shadow-md",
          isLow 
            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        <Link href="/dashboard/billing" className="text-white flex items-center justify-center">
          <Plus className="h-[14px] w-[14px] mr-1 shrink-0" />
          Buy Credits
        </Link>
      </Button>
    </div>
  );
}
