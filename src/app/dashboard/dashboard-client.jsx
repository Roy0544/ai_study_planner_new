"use client";

import { motion } from "motion/react";
import { HyperText } from "@/components/ui/hyper-text";
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
  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-8 max-w-6xl mx-auto w-full flex-1"
    >
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="space-y-2">
          <HyperText 
            className="text-3xl font-bold tracking-tight text-foreground"
            as="h1"
          >
            {`Welcome back, ${displayName}`}
          </HyperText>
          <p className="text-text-secondary">Ready to crush your study goals today?</p>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Sets Created", value: sets.length.toString(), icon: "folder_open" },
            { label: "Credits Balance", value: `${credits} cr`, icon: "payments" },
            { label: "Total Generations", value: assetsGenerated.toString(), icon: "auto_awesome" },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="flex flex-col px-5 py-6 rounded-xl bg-app-card border border-app-border shadow-sm cursor-default"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[12px] text-text-secondary/60">{stat.icon}</span>
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
              </div>
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-mono">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
 
      <motion.div variants={itemVariants}>
        <StudySetCreator />
      </motion.div>

      <motion.div variants={itemVariants}>
        {recentStudySets}
      </motion.div>
    </motion.main>
  );
}
