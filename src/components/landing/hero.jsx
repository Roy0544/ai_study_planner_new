"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MockStudySetPreview() {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-app-border bg-app-card shadow-2xl overflow-hidden relative group">
      {/* Glossy gradient glow behind mock */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-app-brand/20 to-emerald-500/20 blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Browser chrome header */}
      <div className="bg-app-inset/80 border-b border-app-border px-4 py-3 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono select-none">GKVK Engine — Interactive Demo</span>
        <div className="w-12 h-2" />
      </div>

      {/* Demo Tab bar */}
      <div className="bg-app-inset/40 border-b border-app-border flex items-center p-2 gap-2 z-10 relative overflow-x-auto">
        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0",
            activeTab === "notes"
              ? "bg-app-brand/10 text-app-brand border border-app-brand/20"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">notes</span>
          Concept Notes
        </button>
        <button
          onClick={() => setActiveTab("flashcards")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0",
            activeTab === "flashcards"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">style</span>
          Flippable Cards
        </button>
        <button
          onClick={() => setActiveTab("mindmap")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0",
            activeTab === "mindmap"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          Interactive Mind Map
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-8 min-h-[360px] flex items-center justify-center bg-app-card relative z-10 overflow-hidden">
        {activeTab === "notes" && (
          <div className="w-full max-w-2xl text-left space-y-6 select-none">
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Chapter 1: Alkene Reactions & Regiochemistry</h2>
              <div className="h-[2px] w-20 bg-app-brand rounded-full" />
            </div>
            <div className="space-y-4 text-xs text-text-secondary leading-relaxed font-sans">
              <p>
                Alkenes are unsaturated hydrocarbons containing a carbon-carbon double bond. Because of the electron density in the pi-bond, they undergo electrophilic addition reactions readily.
              </p>
              <div className="p-4 bg-app-inset/50 rounded-xl border border-app-border space-y-3">
                <span className="text-[10px] font-bold text-app-brand uppercase tracking-wider">Markovnikov's Rule</span>
                <p className="italic">
                  "In the addition of an acid (HX) to an alkene, the acid hydrogen (H) becomes attached to the double-bonded carbon that starts with the greater number of hydrogen atoms."
                </p>
              </div>
              <p>
                This preference is driven by the stability of the carbocation intermediate. Tertiary carbocations are more stable than secondary, which are more stable than primary due to hyperconjugation and inductive effects.
              </p>
            </div>
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="flex flex-col items-center gap-4 select-none">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Click card to flip</span>
            
            <div
              className="group/card relative h-[220px] w-[360px] [perspective:1000px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={cn(
                  "relative h-full w-full rounded-2xl transition-all duration-500",
                  "[transform-style:preserve-3d]",
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                )}
              >
                {/* Front Side */}
                <div
                  className={cn(
                    "absolute inset-0 h-full w-full rounded-2xl p-6 bg-app-inset border border-orange-500/30 flex flex-col justify-between shadow-xl",
                    "[backface-visibility:hidden] [transform:rotateY(0deg)] transition-all",
                    isFlipped ? "opacity-0" : "opacity-100"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Chemistry Set</span>
                    <span className="material-symbols-outlined text-orange-400 text-sm">school</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary text-center my-auto leading-relaxed">
                    What is the regiochemistry rule for the addition of HBr to an unsymmetrical alkene?
                  </p>
                  <div className="text-[9px] text-text-muted font-mono flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">loop</span> Click to Flip
                  </div>
                </div>

                {/* Back Side */}
                <div
                  className={cn(
                    "absolute inset-0 h-full w-full rounded-2xl p-6 bg-app-inset border border-emerald-500/30 flex flex-col justify-between shadow-xl",
                    "[backface-visibility:hidden] [transform:rotateY(180deg)] transition-all",
                    isFlipped ? "opacity-100 animate-none" : "opacity-0 pointer-events-none"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Answer Key</span>
                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  </div>
                  <p className="text-xs text-text-secondary text-center my-auto leading-relaxed">
                    <strong className="text-text-primary">Markovnikov's Rule:</strong> The H+ adds to the carbon with more hydrogens, forming the more stable carbocation intermediate (usually 2° or 3°), directing Br- to the other carbon.
                  </p>
                  <div className="text-[9px] text-text-muted font-mono flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">loop</span> Click to Flip back
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "mindmap" && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6 select-none">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Hover nodes to reveal reaction branches</span>
            
            <div className="relative w-full h-[260px] bg-app-inset/30 border border-app-border/40 rounded-xl overflow-hidden">
              {/* Responsive SVG Canvas */}
              <svg 
                viewBox="0 0 700 260" 
                className="w-full h-full"
              >
                {/* SVG Connections */}
                {/* Hub to Addition */}
                <path
                  d="M 350,140 L 115,58"
                  stroke={hoveredNode === "addition" ? "#60A5FA" : "#334155"}
                  strokeWidth={hoveredNode === "addition" ? "2" : "1"}
                  fill="none"
                  className="transition-colors duration-300"
                />
                {/* Hub to Substitution */}
                <path
                  d="M 350,140 L 350,38"
                  stroke={hoveredNode === "substitution" ? "#8B5CF6" : "#334155"}
                  strokeWidth={hoveredNode === "substitution" ? "2" : "1"}
                  fill="none"
                  className="transition-colors duration-300"
                />
                {/* Hub to Elimination */}
                <path
                  d="M 350,140 L 580,58"
                  stroke={hoveredNode === "elimination" ? "#F59E0B" : "#334155"}
                  strokeWidth={hoveredNode === "elimination" ? "2" : "1"}
                  fill="none"
                  className="transition-colors duration-300"
                />

                {/* Central Hub */}
                <foreignObject x="270" y="120" width="160" height="40">
                  <div className="w-full h-full rounded-lg bg-app-card border border-app-border flex items-center justify-center text-xs font-bold text-text-primary shadow-lg cursor-default">
                    Organic Reactions
                  </div>
                </foreignObject>

                {/* Branch 1: Addition */}
                <foreignObject x="30" y="40" width="170" height="36">
                  <div
                    className={cn(
                      "w-full h-full rounded-lg border text-[10px] font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center",
                      hoveredNode === "addition"
                        ? "bg-blue-500/10 border-blue-400 text-blue-300 scale-105"
                        : "bg-app-card border-app-border text-text-secondary"
                    )}
                    onMouseEnter={() => setHoveredNode("addition")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    Electrophilic Addition
                  </div>
                </foreignObject>

                {/* Branch 2: Substitution */}
                <foreignObject x="260" y="20" width="180" height="36">
                  <div
                    className={cn(
                      "w-full h-full rounded-lg border text-[10px] font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center",
                      hoveredNode === "substitution"
                        ? "bg-purple-500/10 border-purple-400 text-purple-300 scale-105"
                        : "bg-app-card border-app-border text-text-secondary"
                    )}
                    onMouseEnter={() => setHoveredNode("substitution")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    Nucleophilic Substitution
                  </div>
                </foreignObject>

                {/* Branch 3: Elimination */}
                <foreignObject x="490" y="40" width="180" height="36">
                  <div
                    className={cn(
                      "w-full h-full rounded-lg border text-[10px] font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center",
                      hoveredNode === "elimination"
                        ? "bg-amber-500/10 border-amber-400 text-amber-300 scale-105"
                        : "bg-app-card border-app-border text-text-secondary"
                    )}
                    onMouseEnter={() => setHoveredNode("elimination")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    Base-Induced Elimination
                  </div>
                </foreignObject>
              </svg>

              {/* Details Tooltip Overlay */}
              <div className="absolute bottom-4 inset-x-4 h-8 bg-app-inset/60 border border-app-border/40 rounded-lg flex items-center justify-center px-4 text-[10px] text-text-muted text-center font-mono">
                {hoveredNode === "addition" && "💡 Alkenes + HX / X2 — Mark/Anti-Mark orientation."}
                {hoveredNode === "substitution" && "💡 SN1 (2-step carbocation) vs SN2 (1-step backside attack)."}
                {hoveredNode === "elimination" && "💡 E1 vs E2 pathways forming carbon-carbon double bonds."}
                {!hoveredNode && "Hover any branch to inspect focus summaries."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <Badge variant="outline" className="mb-4 py-1 px-4 text-sm font-medium border-primary/20 bg-primary/5">
        <AnimatedGradientText speed={2} colorFrom="#c0c1ff" colorTo="#8083ff">
          ✨ AI-Powered Learning Evolution
        </AnimatedGradientText>
      </Badge>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Turn Chaotic Documents <br /> Into <AuroraText>Crisp Study Suites</AuroraText>
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
        Instantly transform scattered notes, messy PDFs, and raw text into structured, interactive learning materials with the power of generative AI.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <RainbowButton asChild className="px-8 font-semibold">
          <Link href="/login">Get Started for Free</Link>
        </RainbowButton>
        <Button size="lg" variant="outline" className="px-8 text-md font-semibold gap-2">
          <span className="material-symbols-outlined text-lg">play_circle</span> Watch Demo
        </Button>
      </div>

      <MockStudySetPreview />
    </section>
  );
}
