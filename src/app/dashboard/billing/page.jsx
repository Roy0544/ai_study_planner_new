"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/credits";
import { useEffect } from "react";                                                                                                               
    import { createCreditsOrder, verifyCreditsPayment } from "@/actions/billing";        

const INITIAL_TRANSACTIONS = [
  {
    id: "tx_mock_82103",
    date: "2026-06-21 14:32",
    description: "Generated Study Set: 'Neuroscience Intro'",
    type: "generation_study_set",
    amount: -5,
  },
  {
    id: "tx_mock_61048",
    date: "2026-06-20 18:11",
    description: "Generated Mindmap: 'Mitosis Cell Division'",
    type: "generation_mindmap",
    amount: -2,
  },
  {
    id: "tx_mock_49201",
    date: "2026-06-19 10:05",
    description: "Purchased Popular Pack — 150 credits added",
    type: "purchase",
    amount: 150,
    paymentId: "pay_RzpMock98210",
  },
  {
    id: "tx_mock_31084",
    date: "2026-06-15 09:44",
    description: "Generated Quiz: 'Organic Chemistry Basics'",
    type: "generation_quiz",
    amount: -3,
  },
  {
    id: "tx_mock_11209",
    date: "2026-06-12 11:20",
    description: "Generated Flashcards: 'Spanish Conjugation'",
    type: "generation_flashcards",
    amount: -2,
  },
  {
    id: "tx_mock_08102",
    date: "2026-06-10 16:15",
    description: "Initial Sign-up Bonus Credits",
    type: "bonus",
    amount: 20,
  }
];
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
  const [credits, setCredits] = useState(158); // Simulated credit balance
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [loadingPack, setLoadingPack] = useState(null); // ID of currently purchasing pack
  const [successPack, setSuccessPack] = useState(null); // ID of recently purchased pack
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
   // Inside BillingPage component:                                                                                                                 
    useEffect(() => {                                                                                                                                
      loadRazorpayScript();                                                                                                                          
    }, []);  

  const handleMockPurchase =async (pkg) => {
    console.log(pkg);
    
    if (loadingPack) return;
    setLoadingPack(pkg.id);
    setSuccessPack(null);

    // Simulate Payment Gateway loading for 1.5 seconds

    try {
       const isLoaded = await loadRazorpayScript();                                                                                                 
        if (!isLoaded) {                                                                                                                             
          alert("Failed to load Razorpay. Check your connection.");                                                                                  
          setLoadingPack(null)
          return
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
            // 3. Verify payment signature on server & update database balance                                                                       
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
              const newTx = {                                                                                                                        
                id: response.razorpay_order_id,                                                                                                      
                date: new Date().toISOString().replace("T", " ").substring(0, 16),                                                                   
                description: `Purchased ${pkg.label} — ${pkg.credits} credits`,                                                                      
                type: "purchase",                                                                                                                    
                amount: pkg.credits,                                                                                                                 
                paymentId: response.razorpay_payment_id,                                                                                             
              };                                                                                                                                     
              setTransactions((prev) => [newTx, ...prev]);                                                                                           
            } else {                                                                                                                                 
              alert("Payment verification failed: " + verifyRes.error);                                                                              
            }                                                                                                                                        
            setLoadingPack(null);                                                                                                                    
          },                                                                                                                                         
          modal: {
            ondismiss: () => setLoadingPack(null),
          },
          theme: {
            color: "#8B5CF6", // primary color matched theme
          },
        };
  
        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (error) {
      console.error("Payment flow error:", error);
        alert("An error occurred during checkout.");
        setLoadingPack(null);
    }
    // setTimeout(() => {
    //   const addedCredits = pkg.credits;
    //   const newCreditsBalance = credits + addedCredits;

    //   // Update local state
    //   setCredits(newCreditsBalance);
    //   setLoadingPack(null);
    //   setSuccessPack(pkg.id);

    //   // Add mock transaction
    //   const newTx = {
    //     id: `tx_mock_${Math.floor(10000 + Math.random() * 90000)}`,
    //     date: new Date().toISOString().replace("T", " ").substring(0, 16),
    //     description: `Purchased ${pkg.label} — ${pkg.credits} credits added`,
    //     type: "purchase",
    //     amount: addedCredits,
    //     paymentId: `pay_RzpMock${Math.floor(100000 + Math.random() * 900000)}`,
    //   };

    //   setTransactions((prev) => [newTx, ...prev]);

    //   // Fire a custom window event for sidebar Sync (if Sidebar is listening)
    //   const event = new CustomEvent("credits-updated", { detail: newCreditsBalance });
    //   window.dispatchEvent(event);

    //   // Auto clear success states
    //   setTimeout(() => {
    //     setSuccessPack(null);
    //   }, 3000);
    // }, 1500);
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.paymentId && tx.paymentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="p-6 space-y-8 max-w-6xl mx-auto w-full flex-1">
      {/* Hero Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
            payments
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <AuroraText>Billing & Credits</AuroraText>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Purchase learning credits to synthesize documents, generate quizzes, build interactive mindmaps, and fuel your study suites.
        </p>
      </section>

      {/* Main Grid: Balance & Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Balance Panel & Usage breakdown */}
        <div className="lg:col-span-1 space-y-6">
          {/* Credits Balance Card */}
          <Card className="relative overflow-hidden glass-panel border-muted-foreground/10 bg-surface-container/60 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Current Balance
              </CardDescription>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {credits}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  credits
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((credits / 400) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                With your current balance of <strong className="text-foreground">{credits} credits</strong>, you can generate up to:
                <div className="grid grid-cols-2 gap-2 mt-2 font-medium">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-background/40">
                    <span className="material-symbols-outlined text-xs text-primary">folder</span>
                    <span>{Math.floor(credits / CREDIT_COSTS.study_set)} Study Sets</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-background/40">
                    <span className="material-symbols-outlined text-xs text-secondary">quiz</span>
                    <span>{Math.floor(credits / CREDIT_COSTS.quiz)} Quizzes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Cost Breakdown */}
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
        </div>

        {/* Right: Pricing Cards Grid */}
        <div className="lg:col-span-2 space-y-6">
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
                  {filteredTransactions.length > 0 ? (
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
                            {tx.id}
                            {tx.paymentId && (
                              <button
                                onClick={() => handleCopy(tx.paymentId)}
                                className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity relative"
                                title="Copy Razorpay Payment ID"
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {copiedId === tx.paymentId ? "check" : "content_copy"}
                                </span>
                              </button>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {tx.date}
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
    </main>
  );
}
