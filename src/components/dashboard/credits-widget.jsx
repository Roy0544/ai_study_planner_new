"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserCredits } from "@/actions/billing";
import { BuyCreditsButton } from "@/components/dashboard/buy-credits-button";
import Link from "next/link";

export function CreditsWidget() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

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
    
    const handleSync = (e) => {
      if (e.detail !== undefined) {
        setCredits(e.detail);
      } else {
        fetchCredits();
      }
    };

    window.addEventListener("credits-updated", handleSync);
    return () => window.removeEventListener("credits-updated", handleSync);
  }, [fetchCredits]);

  const handlePurchaseSuccess = (newCredits) => {
    setCredits(newCredits);
  };

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
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${Math.min(((credits ?? 0) / 100) * 100, 100)}%` }}
        />
      </div>

      <BuyCreditsButton
        currentCredits={credits ?? 0}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
