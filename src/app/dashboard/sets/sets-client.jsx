"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StudySetCard } from "@/components/dashboard/study-set-card";
import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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

export default function StudySetsClient({ initialSets }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Live client-side search filtering
  const filteredSets = initialSets.filter((set) => {
    const titleMatch = set.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = set.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = set.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch || catMatch;
  });

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-8 w-full flex-1"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants} 
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <HyperText 
            className="text-3xl font-bold tracking-tight text-text-primary"
            as="h1"
          >
            Your Study Library
          </HyperText>
          <p className="text-text-secondary">Manage and review your AI-generated study suites.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
            <Input 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-app-inset border border-app-border text-text-primary rounded-lg h-10 w-full"
            />
          </div>
          <Button asChild className="rounded-lg font-bold h-10 bg-app-brand hover:bg-app-brand-hover !text-white border-none shadow-sm shrink-0">
            <Link href="/dashboard" className="text-white flex items-center">
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Create New
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Grid Section */}
      <AnimatePresence mode="popLayout">
        {filteredSets.length > 0 ? (
          <motion.div 
            key="grid"
            layout
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          >
            {filteredSets.map((set, index) => (
              <motion.div 
                key={set.id} 
                layout
                variants={itemVariants}
                className={cn(
                  "h-full",
                  index % 2 === 0 ? "lg:col-span-2 col-span-1" : "lg:col-span-1 col-span-1"
                )}
              >
                <StudySetCard set={set} isLarge={index % 2 === 0} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-app-inset flex items-center justify-center border border-app-border text-text-muted">
              <span className="material-symbols-outlined text-4xl">folder_open</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-text-primary">
                {searchQuery ? "No search results found" : "No study sets yet"}
              </h3>
              <p className="text-text-secondary mx-auto text-sm leading-relaxed">
                {searchQuery 
                  ? `We couldn't find any study sets matching "${searchQuery}". Try typing another search term.`
                  : "Start by creating your first AI-powered study set from your notes or files."
                }
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-lg font-bold mt-4 border border-app-border hover:bg-white/5">
              <Link href="/dashboard">
                {searchQuery ? "Create New Set" : "Get Started"}
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
