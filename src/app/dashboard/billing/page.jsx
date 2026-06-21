"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { HyperText } from "@/components/ui/hyper-text";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCreditsOrder, verifyCreditsPayment, getUserCredits, getUserTransactions, redeemVoucher } from "@/actions/billing";

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

export default function BillingPage() {
  const [credits, setCredits] = useState(0); 
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPack, setLoadingPack] = useState(null); // ID of currently purchasing pack
  const [successPack, setSuccessPack] = useState(null); // ID of recently purchased pack
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [policyModal, setPolicyModal] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Load Razorpay & user data from Supabase
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const [creditsRes, txRes] = await Promise.all([
          getUserCredits(),
          getUserTransactions(),
        ]);
        if (creditsRes.success) {
          setCredits(creditsRes.data?.credits || 0);
        }
        if (txRes.success) {
          setTransactions(txRes.data || []);
        }
      } catch (err) {
        console.error("Failed to load billing data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
    loadRazorpayScript();
  }, []);

  // Listen for sidebar sync updates
  useEffect(() => {
    const handleCreditsUpdate = (e) => {
      setCredits(e.detail);
    };
    window.addEventListener("credits-updated", handleCreditsUpdate);
    return () => {
      window.removeEventListener("credits-updated", handleCreditsUpdate);
    };
  }, []);

  const handleRedeemPromo = async () => {
    const codeClean = promoCode.trim().toUpperCase();
    if (!codeClean) return;
    setIsRedeeming(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await redeemVoucher(codeClean);
      if (res.success) {
        setCredits(res.newCredits);
        setPromoSuccess(`🎉 Success! ${res.reward} promo credits added to your account.`);
        setPromoCode("");

        window.dispatchEvent(
          new CustomEvent("credits-updated", { detail: res.newCredits })
        );

        // Fetch latest transactions from Supabase
        const txRes = await getUserTransactions();
        if (txRes.success) {
          setTransactions(txRes.data || []);
        }
      } else {
        setPromoError(res.error || "Failed to redeem promo code.");
      }
    } catch (error) {
      console.error("Voucher redemption error:", error);
      setPromoError("An error occurred during redemption.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleMockPurchase = async (pkg) => {
    if (loadingPack) return;
    setLoadingPack(pkg.id);
    setSuccessPack(null);

    try {
      const isLoaded = await loadRazorpayScript();                                                                                                 
      if (!isLoaded) {                                                                                                                             
        alert("Failed to load Razorpay. Check your connection.");                                                                                  
        setLoadingPack(null);
        return;
      }
      const res = await createCreditsOrder(pkg.id);                                                                                                
      if (!res.success) {                                                                                                                          
        alert("Order creation failed: " + res.error);                                                                                              
        setLoadingPack(null);                                                                                                                      
        return;                                                                                                                                    
      }        
      const options = {                                                                                                                            
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,                                                                                              
        amount: res.order.amount,                                                                                                                  
        currency: res.order.currency,                                                                                                              
        name: "StudyAI",                                                                                                                           
        description: `${pkg.label} — ${pkg.credits} Credits`,                                                                                      
        order_id: res.order.id,                                                                                                                    
        handler: async function (response) {                                                                                                       
          const verifyRes = await verifyCreditsPayment({                                                                                           
            razorpay_order_id: response.razorpay_order_id,                                                                                         
            razorpay_payment_id: response.razorpay_payment_id,                                                                                     
            razorpay_signature: response.razorpay_signature,                                                                                       
            packageId: pkg.id,                                                                                                                     
          });   
          if (verifyRes.success) {                                                                                                                 
            setCredits(verifyRes.newCredits);                                                                                                      
            setSuccessPack(pkg.id);      
            window.dispatchEvent(                                                                                                                  
              new CustomEvent("credits-updated", { detail: verifyRes.newCredits })                                                                 
            );    
            // Fetch updated transactions list from Supabase
            const txRes = await getUserTransactions();
            if (txRes.success) {
              setTransactions(txRes.data || []);
            }
            setTimeout(() => setSuccessPack(null), 3000);
          } else {                                                                                                                                 
            alert("Payment verification failed: " + verifyRes.error);                                                                              
          }                                                                                                                                        
          setLoadingPack(null);                                                                                                                    
        },                                                                                                                                         
        modal: {
          ondismiss: () => setLoadingPack(null),
        },
        theme: {
          color: "#8B5CF6", 
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment flow error:", error);
      alert("An error occurred during checkout.");
      setLoadingPack(null);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return dateStr;
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.razorpay_payment_id && tx.razorpay_payment_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate credit distribution based on real usage data
  const spentByGroup = {
    studySets: 0,
    quizzes: 0,
    visualAssets: 0,
  };

  let totalSpent = 0;

  transactions.forEach((tx) => {
    if (tx.amount < 0) {
      const absAmount = Math.abs(tx.amount);
      totalSpent += absAmount;
      if (tx.type === "generation_study_set") {
        spentByGroup.studySets += absAmount;
      } else if (tx.type === "generation_quiz") {
        spentByGroup.quizzes += absAmount;
      } else if (
        tx.type === "generation_mindmap" ||
        tx.type === "generation_flashcards"
      ) {
        spentByGroup.visualAssets += absAmount;
      } else {
        // Fallback for custom or unidentified generation types
        spentByGroup.visualAssets += absAmount;
      }
    }
  });

  let studySetsPct = 0;
  let quizzesPct = 0;
  let visualAssetsPct = 0;

  if (totalSpent > 0) {
    studySetsPct = Math.round((spentByGroup.studySets / totalSpent) * 100);
    quizzesPct = Math.round((spentByGroup.quizzes / totalSpent) * 100);
    visualAssetsPct = Math.max(0, 100 - studySetsPct - quizzesPct);
  }

  const circumference = 2 * Math.PI * 40; // ~251.327
  const hasUsage = totalSpent > 0;

  const displayStudySets = hasUsage ? studySetsPct : 33.3;
  const displayQuizzes = hasUsage ? quizzesPct : 33.3;
  const displayVisual = hasUsage ? visualAssetsPct : 33.4;

  const studySetsArc = (displayStudySets / 100) * circumference;
  const quizzesArc = (displayQuizzes / 100) * circumference;
  const visualArc = (displayVisual / 100) * circumference;

  const studySetsOffset = 0;
  const quizzesOffset = -studySetsArc;
  const visualOffset = -(studySetsArc + quizzesArc);

  return (
    <main className="p-6 space-y-8 max-w-6xl mx-auto w-full flex-1">
      {/* Hero Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
            payments
          </span>
          <HyperText 
            className="text-3xl font-bold tracking-tight text-foreground"
            as="h1"
          >
            Billing & Credits
          </HyperText>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Purchase learning credits to synthesize documents, generate quizzes, build interactive mindmaps, and fuel your study suites.
        </p>
      </section>

      {/* Redeem Voucher Code Section */}
      <Card className="glass-panel border-muted-foreground/10 bg-surface-container/30 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">
              confirmation_number
            </span>
            Redeem Promo / Voucher Code
          </CardTitle>
          <CardDescription className="text-xs">
            Have a coupon or discount voucher? Enter it below to claim free learning credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code (e.g. WELCOME20)"
              className="flex-1 max-w-2xl px-3 py-1.5 text-xs bg-muted/40 border border-muted-foreground/10 rounded-lg text-foreground focus:outline-hidden focus:border-primary/50 transition-colors uppercase font-mono tracking-wider"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError("");
                setPromoSuccess("");
              }}
            />
            <Button
              size="sm"
              className="text-xs font-bold btn-primary shrink-0 rounded-lg px-4"
              onClick={handleRedeemPromo}
              disabled={isRedeeming || !promoCode.trim()}
            >
              {isRedeeming ? "Verifying..." : "Apply"}
            </Button>
          </div>
          {promoError && (
            <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">error</span>
              {promoError}
            </p>
          )}
          {promoSuccess && (
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              {promoSuccess}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Packages section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const isPopular = pkg.id === "popular";
            const isLoading = loadingPack === pkg.id;
            const isSuccess = successPack === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden transition-all duration-300 glow-hover",
                  isPopular 
                    ? "border-primary/40 bg-surface-container-high/60 shadow-xl scale-[1.02]" 
                    : "border-muted-foreground/10 bg-surface-container/40"
                )}
              >
                {isPopular && (
                  <>
                    <BorderBeam size={100} duration={6} colorFrom="#c0c1ff" colorTo="#8B5CF6" />
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide">
                        Popular
                      </Badge>
                    </div>
                  </>
                )}

                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {pkg.label}
                  </CardDescription>
                  <CardTitle className="text-2xl font-extrabold text-foreground">
                    {pkg.credits} Credits
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">₹{pkg.priceINR}</span>
                    <span className="text-xs text-muted-foreground">one-time</span>
                  </div>

                  <ul className="text-xs space-y-2 text-muted-foreground pt-2">
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold">check</span>
                      Instant credit activation
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold">check</span>
                      Credits never expire
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold">check</span>
                      Generate up to {Math.floor(pkg.credits / 5)} study sets
                    </li>
                    {pkg.id === "pro" && (
                      <li className="flex items-center gap-1.5 font-semibold text-secondary">
                        <span className="material-symbols-outlined text-[14px] text-secondary font-bold">celebration</span>
                        Save over 30% per credit
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className={cn(
                      "w-full font-bold transition-all",
                      isPopular ? "btn-primary hover:opacity-90" : "btn-secondary border border-muted-foreground/20 hover:bg-muted/50"
                    )}
                    disabled={loadingPack !== null || isSuccess}
                    onClick={() => handleMockPurchase(pkg)}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-sm">
                          progress_activity
                        </span>
                        <span>Processing...</span>
                      </div>
                    ) : isSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="material-symbols-outlined text-sm font-bold">
                          task_alt
                        </span>
                        <span>Purchased!</span>
                      </div>
                    ) : (
                      `Buy for ₹${pkg.priceINR}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Secure transaction notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
          <span className="material-symbols-outlined text-primary text-xl">
            lock
          </span>
          <div className="space-y-0.5">
            <strong className="text-foreground font-semibold">Simulated Gateway Active</strong>
            <p>This is a simulated UI checkout experience. No real money or credentials are required.</p>
          </div>
        </div>
      </div>

      {/* Credit Info & Analytics side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Credit Usage Guide */}
        <Card className="glass-panel border-muted-foreground/10 bg-surface-container/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                info
              </span>
              Credit Usage Guide
            </CardTitle>
            <CardDescription className="text-xs">
              Credits consumed per document synthesis action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { icon: "auto_awesome", label: "Study Set synthesis", cost: CREDIT_COSTS.study_set, desc: "Includes flashcards + quiz + notes summary" },
              { icon: "quiz", label: "Quiz generation", cost: CREDIT_COSTS.quiz, desc: "Adds multiple choice queries to set" },
              { icon: "account_tree", label: "Mindmap generation", cost: CREDIT_COSTS.mindmap, desc: "Builds responsive visual hierarchy" },
              { icon: "style", label: "Flashcards deck", cost: CREDIT_COSTS.flashcards, desc: "Generates quick review cards" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-1.5 border-b border-muted-foreground/5 last:border-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="material-symbols-outlined text-sm text-muted-foreground">
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
                <span className="font-extrabold text-primary shrink-0 ml-4">
                  {item.cost} credits
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Credit Distribution SVG Donut Chart */}
        <Card className="glass-panel border-muted-foreground/10 bg-surface-container/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                donut_large
              </span>
              Credit Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Usage breakdown of synthesized materials
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center sm:flex-row gap-6">
            {/* SVG Donut Chart */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
                {/* Outer circle track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="10"
                />
                {hasUsage ? (
                  <>
                    {/* Segment 1: Study Sets */}
                    {studySetsPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="10"
                        strokeDasharray={`${studySetsArc} ${circumference}`}
                        strokeDashoffset={studySetsOffset}
                        className="hover:stroke-[12] transition-all cursor-pointer duration-300"
                        title={`Study Sets: ${studySetsPct}%`}
                      />
                    )}
                    {/* Segment 2: Quizzes */}
                    {quizzesPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${quizzesArc} ${circumference}`}
                        strokeDashoffset={quizzesOffset}
                        className="hover:stroke-[12] transition-all cursor-pointer duration-300"
                        title={`Quizzes: ${quizzesPct}%`}
                      />
                    )}
                    {/* Segment 3: Visual Assets */}
                    {visualAssetsPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${visualArc} ${circumference}`}
                        strokeDashoffset={visualOffset}
                        className="hover:stroke-[12] transition-all cursor-pointer duration-300"
                        title={`Visual Assets: ${visualAssetsPct}%`}
                      />
                    )}
                  </>
                ) : (
                  // Gray placeholder circle when there is no usage data
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#475569"
                    strokeWidth="10"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset="0"
                    title="No usage data yet"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Total</span>
                <span className="text-sm font-extrabold text-foreground mt-0.5 whitespace-nowrap">
                  {hasUsage ? `${totalSpent} cr` : "0 cr"}
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                  <span>Study Sets</span>
                </div>
                <span className="font-extrabold text-foreground">{hasUsage ? `${studySetsPct}%` : "0%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0" />
                  <span>Quizzes</span>
                </div>
                <span className="font-extrabold text-foreground">{hasUsage ? `${quizzesPct}%` : "0%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                  <span>Visual Assets</span>
                </div>
                <span className="font-extrabold text-foreground">{hasUsage ? `${visualAssetsPct}%` : "0%"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction & Billing History */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
            <p className="text-xs text-muted-foreground">
              Review your purchase logs and document synthesis consumption history.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search history..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-muted/30 border border-muted-foreground/10 rounded-lg text-foreground focus:outline-hidden focus:border-primary/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-xl border border-muted-foreground/10 bg-surface-container/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-muted-foreground/10 bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/5">
                <AnimatePresence initial={false}>
                  {loadingData ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="p-4"><div className="h-4 w-24 bg-muted/30 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-28 bg-muted/30 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-48 bg-muted/30 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-16 bg-muted/30 rounded" /></td>
                        <td className="p-4 text-right"><div className="h-4 w-12 bg-muted/30 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <motion.tr
                          key={tx.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-muted/10 transition-colors group"
                        >
                          {/* Transaction ID */}
                          <td className="p-4 font-mono font-medium text-muted-foreground flex items-center gap-1.5">
                            <span title={tx.id}>
                              {tx.id.startsWith("tx_") ? tx.id : `${tx.id.substring(0, 10)}...`}
                            </span>
                            {tx.razorpay_payment_id && (
                              <button
                                onClick={() => handleCopy(tx.razorpay_payment_id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity relative ml-1"
                                title={`Copy Razorpay Payment ID: ${tx.razorpay_payment_id}`}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {copiedId === tx.razorpay_payment_id ? "check" : "content_copy"}
                                </span>
                              </button>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(tx.created_at)}
                          </td>

                          {/* Description */}
                          <td className="p-4 text-foreground font-medium max-w-[280px] md:max-w-xs truncate">
                            {tx.description}
                          </td>

                          {/* Type Badge */}
                          <td className="p-4">
                            <Badge
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5",
                                tx.type === "purchase" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                tx.type.startsWith("generation") && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                                tx.type === "bonus" && "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              )}
                            >
                              {tx.type === "purchase" ? "Purchase" : tx.type === "bonus" ? "Bonus" : "Deduction"}
                            </Badge>
                          </td>

                          {/* Amount */}
                          <td className={cn(
                            "p-4 text-right font-extrabold whitespace-nowrap text-sm",
                            isPositive ? "text-emerald-400" : "text-muted-foreground"
                          )}>
                            {isPositive ? `+${tx.amount}` : tx.amount} cr
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No transactions found matching your search.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer / Compliance Policy Links */}
      <footer className="mt-12 pt-6 border-t border-muted-foreground/10 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <button onClick={() => setPolicyModal("terms")} className="hover:text-primary transition-colors cursor-pointer font-medium">
            Terms & Conditions
          </button>
          <span className="text-muted-foreground/30">•</span>
          <button onClick={() => setPolicyModal("privacy")} className="hover:text-primary transition-colors cursor-pointer font-medium">
            Privacy Policy
          </button>
          <span className="text-muted-foreground/30">•</span>
          <button onClick={() => setPolicyModal("refund")} className="hover:text-primary transition-colors cursor-pointer font-medium">
            Refund & Cancellation Policy
          </button>
          <span className="text-muted-foreground/30">•</span>
          <button onClick={() => setPolicyModal("contact")} className="hover:text-primary transition-colors cursor-pointer font-medium">
            Contact Support
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50">
          © {new Date().getFullYear()} Gkvk_AI. All rights reserved.
        </p>
      </footer>

      {/* Policy Dialog */}
      <Dialog open={policyModal !== null} onOpenChange={(open) => !open && setPolicyModal(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border border-muted-foreground/15 text-foreground rounded-xl">
          {policyModal === "terms" && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-foreground">Terms & Conditions</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>Welcome to StudyAI. By purchasing credits and using our services, you agree to these Terms & Conditions.</p>
                <h4 className="font-bold text-foreground text-sm">1. Credits System</h4>
                <p>Credits purchased on this platform are virtual tokens used to synthesize study material, quizzes, flashcards, and mindmaps. They have no monetary cash value, cannot be redeemed for fiat currency, and are non-transferable.</p>
                <h4 className="font-bold text-foreground text-sm">2. Account Responsibility</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                <h4 className="font-bold text-foreground text-sm">3. Limitation of Liability</h4>
                <p>StudyAI services are provided "as is". We are not responsible for any data loss, service interruptions, or accuracy of AI-synthesized content.</p>
              </div>
            </div>
          )}
          {policyModal === "privacy" && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-foreground">Privacy Policy</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>At StudyAI, we prioritize your data privacy. This policy explains how we collect and use your details.</p>
                <h4 className="font-bold text-foreground text-sm">1. Data Collection</h4>
                <p>We store your email, username, credit balances, and document uploads strictly to process your study generations.</p>
                <h4 className="font-bold text-foreground text-sm">2. Payment Processing</h4>
                <p>All payments are securely handled through Razorpay. We do not store or process your credit card numbers, netbanking credentials, or UPI PINs on our servers.</p>
                <h4 className="font-bold text-foreground text-sm">3. Third-party Sharing</h4>
                <p>We do not sell or share your personal documents or personal data with third-party advertisers.</p>
              </div>
            </div>
          )}
          {policyModal === "refund" && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-foreground">Refund & Cancellation Policy</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>We want you to be fully satisfied with StudyAI. Our refund policy for learning credits is as follows:</p>
                <h4 className="font-bold text-foreground text-sm">1. Eligibility</h4>
                <p>Refunds can be requested within 7 days of purchase, provided none of the credits from that specific package have been consumed.</p>
                <h4 className="font-bold text-foreground text-sm">2. Non-Refundable Items</h4>
                <p>Once credits are used to generate study sets, quizzes, or other materials, the credits become consumed and are non-refundable.</p>
                <h4 className="font-bold text-foreground text-sm">3. How to Request</h4>
                <p>To request a refund, please contact us at <span className="text-primary font-bold">roycomp44@gmail.com</span> with your transaction details and Razorpay Payment ID.</p>
              </div>
            </div>
          )}
          {policyModal === "contact" && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-foreground">Contact Support</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>If you have any questions, feedback, or refund inquiries, please feel free to reach out to us:</p>
                <div className="space-y-3 p-3 bg-muted/40 rounded-lg text-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">email</span>
                    <span>roycomp44@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span>Support Hours: 9 AM - 6 PM IST (Mon-Fri)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    <span>Gkvk college , Bangalore, India</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
