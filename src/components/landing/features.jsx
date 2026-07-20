"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { motion } from "motion/react";

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export function Features() {
  return (
    <section id="features" className="max-w-5xl mx-auto px-6 py-20 border-t border-app-border/40 select-none">
      {/* Header section with Outfit typography */}
      <div className="text-center mb-12 space-y-2">
        <span className="text-[10px] font-bold text-app-brand uppercase tracking-widest">Platform Core</span>
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-text-primary">
          Tools Engineered for Mastery
        </h2>
        <p className="text-text-secondary text-xs mx-auto">
          Ditch passive reading. Our generative engine transforms static text into active visual and interactive materials.
        </p>
      </div>
      
      {/* Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        
        {/* Card 1: Adaptive Quizzes (spans 2 cols) */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.35)" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="md:col-span-2 rounded-xl border border-app-border bg-app-card overflow-hidden relative group min-h-[190px] flex flex-col sm:flex-row justify-between cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />
          
          <div className="p-6 flex flex-col justify-between flex-1 space-y-4 z-10">
            <div className="space-y-2">
              <Badge className="bg-app-brand/10 text-app-brand border border-app-brand/20 font-bold text-[8px] uppercase px-2 py-0 select-none h-4">
                Self-Testing
              </Badge>
              <h3 className="text-lg font-bold text-text-primary tracking-tight">
                Test your recall with adaptive quizzes
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Erase exam anxiety. The AI engine writes custom multiple-choice sets directly from your files, focusing on topics you haven't mastered yet.
              </p>
            </div>
          </div>

          {/* Right Column: Mini Quiz Mockup */}
          <div className="w-full sm:w-[210px] border-t sm:border-t-0 sm:border-l border-app-border bg-app-inset/20 p-5 flex flex-col justify-center gap-2.5 shrink-0 z-10">
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Mock Practice question</span>
            <div className="p-2.5 rounded-lg bg-app-inset border border-app-border text-[9px] font-bold text-text-primary">
              What accelerates SN2 reactions?
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-bold text-emerald-400 flex items-center justify-between">
              <span>Steric hindrance minimization</span>
              <span className="material-symbols-outlined text-[10px]">check_circle</span>
            </div>
            <div className="p-2 rounded-lg bg-app-inset border border-app-border/40 text-[8px] text-text-muted">
              Solvent nucleophilicity increase
            </div>
          </div>
        </motion.div>

        {/* Card 2: Smart Flashcards (spans 1 col) */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(249, 115, 22, 0.35)" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="rounded-xl border border-app-border bg-app-card overflow-hidden relative group p-6 flex flex-col justify-between min-h-[190px] cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />
          
          <div className="space-y-3 z-10">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <span className="material-symbols-outlined text-lg">style</span>
            </div>
            <div className="space-y-1">
              <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[8px] uppercase px-2 py-0 select-none h-4">
                Active Recall
              </Badge>
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                Flippable flashcard decks
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Instantly extract vocabulary terms, dates, formulas, or equations into digital card stacks optimized for spaced repetition.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Structured Notes (spans 1 col) */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.35)" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="rounded-xl border border-app-border bg-app-card overflow-hidden relative group p-6 flex flex-col justify-between min-h-[190px] cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />
          
          <div className="space-y-3 z-10">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-lg">description</span>
            </div>
            <div className="space-y-1">
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[8px] uppercase px-2 py-0 select-none h-4">
                Synthesis
              </Badge>
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                Concise concept notes
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Erase PDF clutter. Extract concise, formatted summary chapters from hundreds of pages of raw documentation automatically.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 4: AI Flowcharts (spans 2 cols) */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.35)" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="md:col-span-2 rounded-xl border border-app-border bg-app-card overflow-hidden relative group min-h-[190px] flex flex-col sm:flex-row justify-between cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />
          
          <div className="p-6 flex flex-col justify-between flex-1 space-y-4 z-10">
            <div className="space-y-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[8px] uppercase px-2 py-0 select-none h-4">
                Logical Connections
              </Badge>
              <h3 className="text-lg font-bold text-text-primary tracking-tight">
                Visualize paths with AI flowcharts
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Transform raw lists of facts into connected visual node maps that illustrate how concepts branch, link, and relate to one another.
              </p>
            </div>
          </div>

          {/* Right Column: Mini Diagram Mockup */}
          <div className="w-full sm:w-[210px] border-t sm:border-t-0 sm:border-l border-app-border bg-app-inset/20 p-5 flex flex-col items-center justify-center shrink-0 z-10 relative overflow-hidden">
            <svg viewBox="0 0 200 120" className="w-36 h-20">
              <line x1="40" y1="60" x2="100" y2="30" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="60" x2="100" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="100" y1="30" x2="160" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="100" y1="90" x2="160" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

              <circle cx="40" cy="60" r="6" fill="#60A5FA" />
              <circle cx="100" cy="30" r="6" fill="#8B5CF6" />
              <circle cx="100" cy="90" r="6" fill="#F59E0B" />
              <circle cx="160" cy="60" r="6" fill="#10B981" />
            </svg>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
