"use client";

import { motion } from "motion/react";
import { HyperText } from "@/components/ui/hyper-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoiseTexture } from "@/components/ui/noise-texture";
import Link from "next/link";
import dynamic from "next/dynamic";

const StudySetCreator = dynamic(() => import("@/components/dashboard/study-set-creator").then(mod => mod.StudySetCreator), {
  loading: () => (
    <div className="h-48 rounded-xl bg-app-card border border-app-border animate-pulse flex flex-col justify-center items-center text-center p-6 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-app-inset/60" />
      <div className="h-4 w-48 bg-app-inset/60 rounded" />
      <div className="h-3 w-72 bg-app-inset/60 rounded" />
    </div>
  ),
  ssr: false
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 120, 
      damping: 14 
    } 
  }
};

export default function DashboardClient({ sets, credits, assetsGenerated, displayName, recentStudySets }) {
  // Compute credits utilization circular arc percentage (max 100 for visual guide)
  const creditPercent = Math.min(Math.max((credits / 100) * 100, 0), 100);

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 w-full flex-1 select-none"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="mb-8 space-y-2">
        <HyperText 
          className="text-3xl font-black tracking-tight text-text-primary"
          as="h1"
          data-display="true"
        >
          {`Welcome back, ${displayName}`}
        </HyperText>
        <p className="text-text-secondary text-xs">Ready to crush your study goals today?</p>
      </motion.div>

      {/* Asymmetric Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Workbench Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Creator workbench block */}
          <motion.div variants={itemVariants} className="space-y-3">
            <span className="text-[10px] font-bold text-app-brand uppercase tracking-widest">Synthesis Workbench</span>
            <StudySetCreator />
          </motion.div>

          {/* Library block */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Study Library</span>
              <span className="text-[10px] text-text-secondary font-mono">{sets.length} sets active</span>
            </div>
            {recentStudySets}
          </motion.div>
        </div>

        {/* Right Sidebar Console (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            variants={itemVariants}
            className="rounded-xl border border-app-border bg-app-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-40 pointer-events-none" />
            <NoiseTexture className="opacity-[0.02]" />

            <div className="space-y-4 z-10 w-full">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Metrics Console</span>
              
              {/* Circular progress SVG */}
              <div className="flex items-center gap-5 py-2">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-app-border/40"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-app-brand transition-all duration-500"
                      strokeDasharray={`${creditPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono leading-none">
                    <span className="text-xs font-bold text-text-primary">{credits}</span>
                    <span className="text-[7px] text-text-muted uppercase font-bold mt-0.5">cr</span>
                  </div>
                </div>
                
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">Credits Balance</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Used to synthesize lectures and generate learning materials.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats list */}
            <div className="space-y-3 pt-6 border-t border-app-border/60 z-10 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Sets Created</span>
                <span className="font-bold text-text-primary font-mono">{sets.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Total Generations</span>
                <span className="font-bold text-text-primary font-mono">{assetsGenerated}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Account Status</span>
                <Badge variant="outline" className="text-[8px] bg-app-brand/10 text-app-brand border-app-brand/20 uppercase font-bold py-0 h-4 px-1.5 rounded">
                  Scholar Free
                </Badge>
              </div>
            </div>

            {/* Quick navigators list */}
            <div className="pt-6 border-t border-app-border/60 z-10 w-full flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full text-left justify-start gap-2 text-[10px] font-bold h-9 border-app-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
                <Link href="/dashboard/billing">
                  <span className="material-symbols-outlined text-[13px]">add_circle</span>
                  Buy Credit Packs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full text-left justify-start gap-2 text-[10px] font-bold h-9 border-app-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
                <Link href="/dashboard/share">
                  <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
                  Browse Shared Hub
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.main>
  );
}
