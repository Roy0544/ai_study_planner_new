"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserCredits } from "@/actions/billing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import client from "@/config/client";

export function CreditsWidget() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/10 space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/billing"
          className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1 group"
        >
          Credits Balance
          <span className="material-symbols-outlined text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
            open_in_new
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-primary text-[14px]">toll</span>
          <span className="text-[10px] font-bold text-foreground">
            {loading ? "..." : `${credits ?? 0} left`}
          </span>
        </div>
      </div>

      {/* Credits progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isLow ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(((credits ?? 0) / 100) * 100, 100)}%` }}
        />
      </div>

      <Button
        size="sm"
        asChild
        className={cn(
          "w-full h-8 text-[11px] font-bold rounded-lg shadow-sm transition-all",
          isLow 
            ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-md shadow-amber-500/20"
            : "bg-primary text-primary-foreground"
        )}
      >
        <Link href="/dashboard/billing">
          <span className="material-symbols-outlined text-[14px] mr-1">
            add_circle
          </span>
          Buy Credits
        </Link>
      </Button>
    </div>
  );
}
