"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createCreditsOrder, verifyCreditsPayment, getUserCredits, getUserTransactions, redeemVoucher } from "@/actions/billing";
import Link from "next/link";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [policyModal, setPolicyModal] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
          } else {                                                                                                                                 
            alert("Payment verification failed: " + verifyRes.error);                                                                              
          }                                                                                                                                        
          setLoadingPack(null);                                                                                                                    
        },                                                                                                                                         
        prefill: {                                                                                                                                 
          email: "student@gkvk.ai",                                                                                                                
        },                                                                                                                                         
        theme: {                                                                                                                                   
          color: "#60A5FA",                                                                                                                        
        },                                                                                                                                         
        modal: {                                                                                                                                   
          ondismiss: function () {                                                                                                                 
            setLoadingPack(null);                                                                                                                  
          }                                                                                                                                        
        }                                                                                                                                          
      };                                                                                                                                           
      const rzp = new window.Razorpay(options);                                                                                                    
      rzp.open();                                                                                                                                  
    } catch (err) {                                                                                                                                
      console.error("Payment setup failed:", err);                                                                                                 
      alert("Error setting up payment: " + err.message);                                                                                           
      setLoadingPack(null);                                                                                                                        
    }                                                                                                                                              
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  // Compute stats for visualization
  const totalSpent = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const studySetsSpent = transactions
    .filter((t) => t.amount < 0 && t.type.includes("study_set"))
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const quizzesSpent = transactions
    .filter((t) => t.amount < 0 && t.type.includes("quiz"))
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const visualSpent = transactions
    .filter((t) => t.amount < 0 && (t.type.includes("mindmap") || t.type.includes("flowchart")))
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalSegmentSpent = studySetsSpent + quizzesSpent + visualSpent || 1;
  const studySetsPct = Math.round((studySetsSpent / totalSegmentSpent) * 100);
  const quizzesPct = Math.round((quizzesSpent / totalSegmentSpent) * 100);
  const visualAssetsPct = Math.round((visualSpent / totalSegmentSpent) * 100);

  const circumference = 2 * Math.PI * 40;
  const studySetsArc = (studySetsPct / 100) * circumference;
  const quizzesArc = (quizzesPct / 100) * circumference;
  const visualArc = (visualAssetsPct / 100) * circumference;

  const studySetsOffset = circumference - studySetsArc;
  const quizzesOffset = circumference - studySetsArc - quizzesArc;
  const visualOffset = circumference - studySetsArc - quizzesArc - visualArc;

  const hasUsage = totalSpent > 0;

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((tx) =>
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="p-6 space-y-10 max-w-6xl mx-auto w-full flex-1 select-none text-text-primary bg-app-bg">
      {/* Title Header with Outfit typography */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-text-primary tracking-tight" data-display="true">
          Billing & Credit Console
        </h1>
        <p className="text-text-secondary text-xs">Manage your study credits, redeem vouchers, and review transaction invoices.</p>
      </div>

      {/* Top Grid: Balance & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance & Promo Card (2/3 width) */}
        <Card className="lg:col-span-2 border border-app-border bg-app-card rounded-xl overflow-hidden relative p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
          <div className="absolute inset-0 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-40 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full items-center">
            {/* Balance Details */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Available Balance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-text-primary tracking-tighter font-mono">{credits}</span>
                <span className="text-xs font-bold text-app-brand uppercase tracking-widest">credits</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Active learning balance. This allows you to generate new study suites and visual process flowcharts instantly.
              </p>
            </div>

            {/* Promo Voucher input */}
            <div className="space-y-3 p-4 rounded-xl bg-app-inset/40 border border-app-border/40">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Redeem Promo Voucher</span>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Voucher code (e.g. WELCOME20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-app-inset border border-app-border text-text-primary rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-app-brand"
                />
                <Button
                  size="sm"
                  className="text-xs font-bold bg-app-brand hover:bg-app-brand-hover text-app-inset shrink-0 rounded-lg px-4 h-9 transition-all cursor-pointer"
                  onClick={handleRedeemPromo}
                  disabled={isRedeeming || !promoCode.trim()}
                >
                  {isRedeeming ? "Verifying..." : "Apply"}
                </Button>
              </div>
              {promoError && (
                <p className="text-[10px] text-red-400 font-medium flex items-center gap-1">
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
            </div>
          </div>
        </Card>

        {/* Credit Distribution (1/3 width) */}
        <Card className="lg:col-span-1 border border-app-border bg-app-card rounded-xl overflow-hidden relative p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
          <div className="absolute inset-0 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-20 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />

          <div className="space-y-4 z-10 w-full">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Credit Distribution</span>
            <div className="flex items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                  {hasUsage ? (
                    <>
                      {studySetsPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#60A5FA"
                          strokeWidth="12"
                          strokeDasharray={`${studySetsArc} ${circumference}`}
                          strokeDashoffset={studySetsOffset}
                          className="hover:stroke-[14] transition-all cursor-pointer duration-300"
                        />
                      )}
                      {quizzesPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#8B5CF6"
                          strokeWidth="12"
                          strokeDasharray={`${quizzesArc} ${circumference}`}
                          strokeDashoffset={quizzesOffset}
                          className="hover:stroke-[14] transition-all cursor-pointer duration-300"
                        />
                      )}
                      {visualAssetsPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#10B981"
                          strokeWidth="12"
                          strokeDasharray={`${visualArc} ${circumference}`}
                          strokeDashoffset={visualOffset}
                          className="hover:stroke-[14] transition-all cursor-pointer duration-300"
                        />
                      )}
                    </>
                  ) : (
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="12" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono leading-none">
                  <span className="text-[10px] font-bold text-text-primary">{totalSpent}</span>
                  <span className="text-[6px] text-text-muted uppercase font-bold mt-0.5">used</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex-1 space-y-1.5 text-[10px] font-medium text-text-secondary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#60A5FA] shrink-0" />
                    <span>Study Sets</span>
                  </div>
                  <span className="font-bold text-text-primary font-mono">{hasUsage ? `${studySetsPct}%` : "0%"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
                    <span>Quizzes</span>
                  </div>
                  <span className="font-bold text-text-primary font-mono">{hasUsage ? `${quizzesPct}%` : "0%"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                    <span>Visuals</span>
                  </div>
                  <span className="font-bold text-text-primary font-mono">{hasUsage ? `${visualAssetsPct}%` : "0%"}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Select Credit Packages Grid */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Select Credit Packages</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const isPopular = pkg.id === "popular";
            const isLoading = loadingPack === pkg.id;
            const isSuccess = successPack === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden transition-all duration-300 border bg-app-card rounded-xl min-h-[220px] shadow-sm",
                  isPopular 
                    ? "border-app-brand bg-gradient-to-b from-app-brand/5 to-transparent scale-[1.02] shadow-md" 
                    : "border-app-border"
                )}
              >
                {isPopular && (
                  <>
                    <BorderBeam size={100} duration={6} colorFrom="#60A5FA" colorTo="#8B5CF6" />
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-app-brand text-app-inset font-black text-[8px] px-2 py-0.5 uppercase tracking-wide rounded">
                        Popular
                      </Badge>
                    </div>
                  </>
                )}

                <CardHeader className="space-y-1 p-5">
                  <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    {pkg.label}
                  </CardDescription>
                  <CardTitle className="text-xl font-black text-text-primary" data-display="true">
                    <span className="font-mono">{pkg.credits}</span> Credits
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 px-5 flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-text-primary font-mono">₹{pkg.priceINR}</span>
                    <span className="text-[10px] text-text-secondary">one-time</span>
                  </div>

                  <ul className="text-[10px] space-y-2 text-text-secondary pt-2">
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500 font-bold">check</span>
                      Instant credit activation
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500 font-bold">check</span>
                      Credits never expire
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500 font-bold">check</span>
                      Generate up to <span className="font-mono">{Math.floor(pkg.credits / CREDIT_COSTS.study_set)}</span> study sets
                    </li>
                    {pkg.id === "pro" && (
                      <li className="flex items-center gap-1.5 font-bold text-app-brand">
                        <span className="material-symbols-outlined text-[13px] text-app-brand font-bold">celebration</span>
                        Save over 30% per credit
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="p-5 pt-2">
                  <Button
                    className={cn(
                      "w-full font-bold text-xs h-9 rounded-lg transition-all cursor-pointer",
                      isPopular 
                        ? "bg-app-brand hover:bg-app-brand-hover text-app-inset border-none shadow-sm" 
                        : "bg-transparent border border-app-border text-text-secondary hover:text-text-primary hover:bg-white/5"
                    )}
                    disabled={loadingPack !== null || isSuccess}
                    onClick={() => handleMockPurchase(pkg)}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        <span>Processing...</span>
                      </div>
                    ) : isSuccess ? (
                      <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold">
                        <span className="material-symbols-outlined text-sm font-bold">task_alt</span>
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

        {/* Secure Transaction notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-app-inset/40 border border-app-border/40 text-[10px] text-text-secondary">
          <span className="material-symbols-outlined text-app-brand text-lg">lock</span>
          <div className="space-y-0.5">
            <strong className="text-text-primary font-bold">Simulated Checkout Active</strong>
            <p>This is a simulated UI payment checkout experience. No real money or credentials are required.</p>
          </div>
        </div>
      </div>

      {/* Credit Guides & Transaction Invoices Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Usage Cost Guide (1/3 width) */}
        <Card className="lg:col-span-1 self-start border border-app-border bg-app-card rounded-xl overflow-hidden relative p-5 flex flex-col justify-between shadow-sm min-h-[300px]">
          <div className="space-y-4 w-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Usage Guide</span>
              <p className="text-[10px] text-text-secondary">Credits consumed per document synthesis action</p>
            </div>
            
            <div className="space-y-2 pt-2">
              {[
                { icon: "auto_awesome", label: "Study Set Synthesis", cost: CREDIT_COSTS.study_set, desc: "Includes flashcards + quiz + notes" },
                { icon: "quiz", label: "Quiz Generation", cost: CREDIT_COSTS.quiz, desc: "Adds multiple choice queries" },
                { icon: "account_tree", label: "Mindmap Generation", cost: CREDIT_COSTS.mindmap, desc: "Builds responsive visual hierarchy" },
                { icon: "style", label: "Flashcards Deck", cost: CREDIT_COSTS.flashcards, desc: "Generates quick review cards" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs py-2 border-b border-app-border/40 last:border-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-text-primary">
                      <span className="material-symbols-outlined text-xs text-text-secondary">
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                    <span className="text-[9px] text-text-secondary">{item.desc}</span>
                  </div>
                  <span className="font-bold text-app-brand shrink-0 ml-4 font-mono">
                    {item.cost} cr
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Invoices Table (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Transaction Invoices</span>
              <p className="text-[10px] text-text-secondary">Review your credit purchases and consumption logs</p>
            </div>

            <div className="relative w-full sm:w-60">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
              <input
                type="text"
                placeholder="Search history..."
                className="w-full pl-9 pr-4 py-2 text-[10px] bg-app-inset border border-app-border rounded-lg text-text-primary focus:outline-none focus:border-app-brand focus:ring-1 focus:ring-app-brand transition-all font-medium h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-app-border bg-app-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-app-border bg-app-inset/40 text-text-secondary font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/40 text-text-secondary">
                  <AnimatePresence initial={false}>
                    {loadingData ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={`skeleton-${i}`} className="animate-pulse">
                          <td className="p-3.5"><div className="h-3 w-16 bg-app-inset/60 rounded" /></td>
                          <td className="p-3.5"><div className="h-3 w-24 bg-app-inset/60 rounded" /></td>
                          <td className="p-3.5"><div className="h-3 w-40 bg-app-inset/60 rounded" /></td>
                          <td className="p-3.5"><div className="h-3 w-12 bg-app-inset/60 rounded" /></td>
                          <td className="p-3.5 text-right"><div className="h-3 w-8 bg-app-inset/60 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredTransactions.length > 0 ? (
                      paginatedTransactions.map((tx) => {
                        const isPositive = tx.amount > 0;
                        return (
                          <motion.tr
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hover:bg-white/5 transition-colors group"
                          >
                            {/* Transaction ID */}
                            <td className="p-3.5 font-mono font-medium text-text-secondary flex items-center gap-1.5">
                              <span title={tx.id}>
                                {tx.id.startsWith("tx_") ? tx.id : `${tx.id.substring(0, 10)}...`}
                              </span>
                              {tx.razorpay_payment_id && (
                                <button
                                  onClick={() => handleCopy(tx.razorpay_payment_id)}
                                  className="opacity-0 group-hover:opacity-100 hover:text-app-brand transition-opacity relative ml-1 cursor-pointer"
                                  title={`Copy Payment ID: ${tx.razorpay_payment_id}`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {copiedId === tx.razorpay_payment_id ? "check" : "content_copy"}
                                  </span>
                                </button>
                              )}
                            </td>

                            {/* Date */}
                            <td className="p-3.5 text-text-secondary whitespace-nowrap font-mono">
                              {formatDate(tx.created_at)}
                            </td>

                            {/* Description */}
                            <td className="p-3.5 text-text-primary font-medium max-w-[200px] truncate">
                              {tx.description}
                            </td>

                            {/* Type */}
                            <td className="p-3.5">
                              <Badge
                                className={cn(
                                  "text-[8px] font-black uppercase tracking-wider px-1.5 py-0 h-4 rounded",
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
                              "p-3.5 text-right font-bold whitespace-nowrap font-mono",
                              isPositive ? "text-emerald-400" : "text-text-muted"
                            )}>
                              {isPositive ? `+${tx.amount}` : tx.amount} cr
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-muted">
                          No transactions found matching your search.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-[10px] text-text-secondary font-medium">
                Showing <span className="font-bold text-text-primary">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-bold text-text-primary">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}
                </span>{" "}
                of <span className="font-bold text-text-primary">{filteredTransactions.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg font-bold border border-app-border hover:bg-white/5 disabled:opacity-50 text-[10px] h-7 cursor-pointer"
                >
                  Previous
                </Button>
                <div className="text-[10px] text-text-primary font-bold px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg font-bold border border-app-border hover:bg-white/5 disabled:opacity-50 text-[10px] h-7 cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer / Compliance Policy Links */}
      <footer className="mt-12 pt-6 border-t border-app-border/40 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          <button onClick={() => setPolicyModal("terms")} className="hover:text-app-brand transition-colors cursor-pointer">
            Terms & Conditions
          </button>
          <span className="text-app-border/40">•</span>
          <button onClick={() => setPolicyModal("privacy")} className="hover:text-app-brand transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <span className="text-app-border/40">•</span>
          <button onClick={() => setPolicyModal("refund")} className="hover:text-app-brand transition-colors cursor-pointer">
            Refund Policy
          </button>
          <span className="text-app-border/40">•</span>
          <button onClick={() => setPolicyModal("contact")} className="hover:text-app-brand transition-colors cursor-pointer">
            Contact Support
          </button>
        </div>
        <p className="text-[9px] text-text-muted font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} gkvk.ai. All rights reserved.
        </p>
      </footer>

      {/* Policy Dialog */}
      <Dialog open={policyModal !== null} onOpenChange={(open) => !open && setPolicyModal(null)}>
        <DialogContent className="w-[90vw] md:w-[600px] !max-w-none max-h-[80vh] overflow-y-auto bg-app-card border border-app-border text-text-primary rounded-xl p-6 shadow-xl">
          {policyModal === "terms" && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-text-primary uppercase tracking-wider">Terms & Conditions</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                <p>Welcome to gkvk.ai. By purchasing credits and using our services, you agree to these Terms & Conditions.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">1. Credits System</h4>
                <p>Credits purchased on this platform are virtual tokens used to synthesize study material, quizzes, flashcards, and mindmaps. They have no monetary cash value, cannot be redeemed for fiat currency, and are non-transferable.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">2. Account Responsibility</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">3. Limitation of Liability</h4>
                <p>gkvk.ai services are provided "as is". We are not responsible for any data loss, service interruptions, or accuracy of AI-synthesized content.</p>
              </div>
            </div>
          )}
          {policyModal === "privacy" && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-text-primary uppercase tracking-wider">Privacy Policy</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                <p>At gkvk.ai, we prioritize your data privacy. This policy explains how we collect and use your details.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">1. Data Collection</h4>
                <p>We store your email, username, credit balances, and document uploads strictly to process your study generations.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">2. Payment Processing</h4>
                <p>All payments are securely handled through Razorpay. We do not store or process your credit card numbers, netbanking credentials, or UPI PINs on our servers.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">3. Third-party Sharing</h4>
                <p>We do not sell or share your personal documents or personal data with third-party advertisers.</p>
              </div>
            </div>
          )}
          {policyModal === "refund" && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-text-primary uppercase tracking-wider">Refund & Cancellation Policy</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                <p>We want you to be fully satisfied with gkvk.ai. Our refund policy for learning credits is as follows:</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">1. Refund Eligibility</h4>
                <p>Refunds can be requested within 7 days of purchase, provided none of the credits from that specific package have been consumed.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">2. Non-Refundable Items</h4>
                <p>Once credits are used to generate study sets, quizzes, or other materials, the credits become consumed and are non-refundable.</p>
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wide mt-2">3. How to Request</h4>
                <p>To request a refund, please contact us at <span className="text-app-brand font-bold">roycomp44@gmail.com</span> with your transaction details and Razorpay Payment ID.</p>
              </div>
            </div>
          )}
          {policyModal === "contact" && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-text-primary uppercase tracking-wider">Contact Support</DialogTitle>
              </DialogHeader>
              <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
                <p>If you have any questions, feedback, or refund inquiries, please feel free to reach out to us:</p>
                <div className="space-y-3 p-3.5 bg-app-inset/60 border border-app-border rounded-xl text-text-primary font-medium mt-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-app-brand">email</span>
                    <span>roycomp44@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-app-brand">schedule</span>
                    <span>Support Hours: 9 AM - 6 PM IST (Mon-Fri)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-app-brand">location_on</span>
                    <span>GKVK College, Bangalore, India</span>
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
