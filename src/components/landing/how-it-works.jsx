"use client";

import { WorkflowBeam } from "@/components/workflow-beam";
import { KineticText } from "@/components/ui/kinetic-text";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section className="py-24 border-t border-app-border/40 bg-app-inset/10 select-none">
      <div className="container mx-auto px-6">
        {/* Header with Outfit typography */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-app-brand uppercase tracking-widest">Workflow</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
            Three Simple Steps
          </h2>
          <p className="text-text-secondary text-sm mx-auto">
            From raw documents to synthesized, interactive study systems in seconds.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Animated beam reflecting current hovered index */}
          <WorkflowBeam className="py-12" showLabels={false} activeStep={activeStep} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-4">
            
            {/* Step 1: Upload */}
            <div 
              className={cn(
                "p-6 rounded-2xl border transition-all duration-300 text-center space-y-3 cursor-default",
                activeStep === 1
                  ? "bg-app-brand/5 border-app-brand/35 scale-[1.02] shadow-[0_0_15px_rgba(96,165,250,0.1)]"
                  : "bg-transparent border-transparent"
              )}
              onMouseEnter={() => setActiveStep(1)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <h3 className={cn("text-lg font-bold transition-colors", activeStep === 1 ? "text-app-brand" : "text-text-primary")}>
                1. Upload Materials
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Drop your PDFs, lecture slide decks, research papers, or notes directly into the creator box.
              </p>
            </div>

            {/* Step 2: Synthesize */}
            <div 
              className={cn(
                "p-6 rounded-2xl border transition-all duration-300 text-center space-y-3 cursor-default",
                activeStep === 2
                  ? "bg-purple-500/5 border-purple-500/35 scale-[1.02] shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  : "bg-transparent border-transparent"
              )}
              onMouseEnter={() => setActiveStep(2)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <h3 className={cn("text-lg font-bold transition-colors", activeStep === 2 ? "text-purple-400" : "text-text-primary")}>
                2. AI Synthesis
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                The generative engine scans, summarizes, and maps out key concepts and vocab terms instantly.
              </p>
            </div>

            {/* Step 3: Learn */}
            <div 
              className={cn(
                "p-6 rounded-2xl border transition-all duration-300 text-center space-y-3 cursor-default",
                activeStep === 3
                  ? "bg-emerald-500/5 border-emerald-500/35 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-transparent border-transparent"
              )}
              onMouseEnter={() => setActiveStep(3)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <h3 className={cn("text-lg font-bold transition-colors", activeStep === 3 ? "text-emerald-400" : "text-text-primary")}>
                3. Active Practice
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Start study sessions with digital flashcard decks, custom quizzes, and responsive mind maps.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
