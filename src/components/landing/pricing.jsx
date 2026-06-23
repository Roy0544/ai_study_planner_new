"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import Link from "next/link";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    credits: 490,
    priceINR: 49,
    label: "Starter Pack",
    description: "Ideal for quick homework assistance and exploring the platform.",
    features: [
      "490 Generative Credits",
      "Upload PDF, DOCX, PPTX",
      "Full Study Set generations",
      "Access to community notes & papers",
    ],
    popular: false,
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
    glow: "bg-blue-500/5",
  },
  {
    id: "popular",
    credits: 1500,
    priceINR: 129,
    label: "Popular Pack",
    description: "Perfect for monthly exam prep, intensive study guides, and revisions.",
    features: [
      "1,500 Generative Credits",
      "Upload larger textbooks & papers",
      "Priority AI queue processing",
      "Fulfill community requests for rewards",
      "Extra credit bonuses (+10%)",
    ],
    popular: true,
    color: "from-secondary/10 to-[#8B5CF6]/15 border-secondary/40",
    glow: "bg-secondary/10",
  },
  {
    id: "pro",
    credits: 3750,
    priceINR: 299,
    label: "Pro Pack",
    description: "Ultimate plan for research scholars and students aiming for top marks.",
    features: [
      "3,750 Generative Credits",
      "Unlimited file upload capacity",
      "Advanced context cache support",
      "Highest quality AI synthesis (3.5 Pro)",
      "Lifetime storage of generated material",
    ],
    popular: false,
    color: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
    glow: "bg-purple-500/5",
  },
];

const CREDIT_COSTS = [
  { name: "Complete Study Set", cost: "150 credits", icon: "auto_awesome" },
  { name: "Practice Quiz (10 MCQs)", cost: "8 credits", icon: "quiz" },
  { name: "Active Recall Flashcards", cost: "6 credits", icon: "style" },
  { name: "Interactive Mind Map", cost: "5 credits", icon: "account_tree" },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-[#c0c1ff] to-[#8B5CF6] bg-clip-text text-transparent">
            Transparent, Pay-As-You-Go Pricing
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No recurring monthly subscriptions. Buy credits when you need them, consume them per generation task. Enjoy a 55% to 60% customer savings rate.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {CREDIT_PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="flex h-full"
            >
              <LiquidGlassCard
                glassSize="sm"
                className={`flex-1 flex flex-col justify-between rounded-3xl border bg-transparent ${pkg.color} p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Inner ambient glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none ${pkg.glow}`} />

                <div>
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider animate-pulse">
                      Best Value
                    </span>
                  )}

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs uppercase font-extrabold tracking-widest">{pkg.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">₹{pkg.priceINR}</span>
                      <span className="text-muted-foreground text-xs font-semibold">one-time payment</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">{pkg.description}</p>
                  </div>

                  {/* Credits amount */}
                  <div className="my-6 p-4 rounded-2xl bg-muted/40 border border-muted-foreground/5 flex items-center justify-between text-foreground">
                    <span className="text-xs font-semibold text-muted-foreground">Credits Loaded:</span>
                    <span className="text-xl font-extrabold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px] text-primary">toll</span>
                      {pkg.credits.toLocaleString()} cr
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 my-6 text-xs text-muted-foreground">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#8B5CF6] mt-0.5 font-bold">check</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild
                  className={`w-full rounded-2xl font-bold h-11 text-xs mt-4 ${
                    pkg.popular
                      ? "bg-secondary text-secondary-foreground hover:bg-[#7c3aed] shadow-md shadow-secondary/20"
                      : "bg-muted hover:bg-muted/80 text-foreground border border-muted-foreground/10"
                  }`}
                >
                  <Link href="/login">Buy Package</Link>
                </Button>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>

        {/* Credits Cost Reference Box */}
        <LiquidGlassCard
          glassSize="sm"
          className="p-6 md:p-8 rounded-3xl bg-transparent border-muted-foreground/10 w-full flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 flex-grow relative z-10">
            <h3 className="text-lg font-bold text-foreground">How Credits are Consumed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every action consumes credits based on its token cost. Generating flashcards or mindmaps is extremely lightweight. Creating full synthesised study sets extracts chapters page-by-page.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 relative z-10">
            {CREDIT_COSTS.map((item, i) => (
              <div key={i} className="p-3 bg-background/50 border border-muted-foreground/5 rounded-2xl flex flex-col gap-1 items-start text-xs min-w-[150px]">
                <div className="flex items-center gap-1 text-[#c0c1ff]">
                  <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                  <span className="font-semibold text-[10px] text-muted-foreground uppercase">{item.name}</span>
                </div>
                <span className="font-extrabold text-foreground">{item.cost}</span>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
}
