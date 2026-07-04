"use client";

import { useState, useEffect } from "react";
import { createCreditsOrder, verifyCreditsPayment } from "@/actions/billing";
import { CREDIT_PACKAGES } from "@/lib/credits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyCreditsButton({ currentCredits = 0, onSuccess, isLow = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null); // packageId being processed

  // Pre-load the Razorpay checkout script as soon as the component mounts
  // so it's ready before the user clicks "Buy" — avoids the React script-in-render warning
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePurchase = async (pkg) => {
    setLoading(pkg.id);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay. Check your internet connection.");
        return;
      }

      // 1. Create order on server
      const res = await createCreditsOrder(pkg.id);
      if (!res.success) {
        alert("Failed to create payment order: " + res.error);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: res.order.amount,
        currency: res.order.currency,
        name: "StudyAI",
        description: `${pkg.label} — ${pkg.credits} Credits`,
        order_id: res.order.id,
        handler: async function (response) {
          // 3. Verify payment on server and credit the user
          const verifyRes = await verifyCreditsPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            packageId: pkg.id,
          });

          if (verifyRes.success) {
            setOpen(false);
            onSuccess?.(verifyRes.newCredits);
            alert(`🎉 Payment successful! ${pkg.credits} credits added. New balance: ${verifyRes.newCredits} credits.`);
          } else {
            alert("Payment verification failed: " + verifyRes.error);
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={cn(
            "w-full h-8 text-[11px] font-bold rounded-lg shadow-sm transition-all border-none text-white",
            isLow 
              ? "bg-amber-500 hover:bg-amber-600 animate-pulse shadow-md shadow-amber-500/20"
              : "bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20"
          )}
        >
          <span className="material-symbols-outlined text-[14px] mr-1">
            add_circle
          </span>
          Buy Credits
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border border-app-border bg-app-card text-text-primary rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            <span className="material-symbols-outlined text-orange-500">
              payments
            </span>
            Buy Study Credits
          </DialogTitle>
        </DialogHeader>

        {/* Current balance indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/20 text-sm">
          <span className="material-symbols-outlined text-orange-400 text-base">
            toll
          </span>
          <span className="text-muted-foreground">Current balance:</span>
          <span className="font-bold text-orange-400">{currentCredits} credits</span>
        </div>

        {/* Credit packages */}
        <div className="space-y-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                pkg.id === "popular"
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-muted-foreground/10 bg-muted/20"
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{pkg.label}</span>
                  {pkg.id === "popular" && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500 text-white">
                      Best Value
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-xs mt-0.5">
                  {pkg.credits} credits
                </span>
              </div>

              <Button
                size="sm"
                variant={pkg.id === "popular" ? "default" : "outline"}
                className={cn(
                  "text-xs font-bold rounded-lg min-w-[80px]",
                  pkg.id === "popular"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm"
                    : "border-app-border text-text-secondary hover:bg-white/5"
                )}
                disabled={loading === pkg.id}
                onClick={() => handlePurchase(pkg)}
              >
                {loading === pkg.id ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  `₹${pkg.priceINR}`
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Credit usage guide */}
        <div className="mt-1 p-3 rounded-lg bg-muted/30 space-y-1.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Credit costs per task
          </p>
          {[
            { icon: "auto_awesome", label: "Generate Study Set", cost: 5 },
            { icon: "account_tree", label: "Generate Mindmap", cost: 2 },
            { icon: "style", label: "Generate Flashcards", cost: 2 },
            { icon: "quiz", label: "Generate Quiz", cost: 3 },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="material-symbols-outlined text-[14px]">
                  {item.icon}
                </span>
                {item.label}
              </div>
              <span className="font-bold text-foreground">{item.cost} credits</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
