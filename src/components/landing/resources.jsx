"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const SAMPLE_RESOURCES = [
  {
    title: "Advanced Soil Physics (SS-302) Midterm Paper",
    course: "SS-302: Soil Physics",
    type: "Exam Paper",
    size: "2.4 MB",
    downloads: 128,
    icon: "quiz",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    title: "Crop Physiology & Metabolism - Complete Lecture Notes",
    course: "CP-101: Crop Physiology",
    type: "Lecture Notes",
    size: "8.1 MB",
    downloads: 345,
    icon: "description",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    title: "Agricultural Entomology - Pest Identification Guide",
    course: "ENT-211: Applied Entomology",
    type: "Study Guide",
    size: "15.4 MB",
    downloads: 212,
    icon: "menu_book",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

export function Resources() {
  return (
    <section id="resources" className="py-24 relative overflow-hidden bg-background/50 border-t border-muted-foreground/10">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left panel: Info & benefits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#c0c1ff]">University Sharing Feed</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              A Shared Knowledge Base Built by Students
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Don't study in isolation. Access past question banks, exam solutions, and lecture transcript summaries shared directly by peers and faculty members. 
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Earn Peer Credits", desc: "Upload past papers or notes, and earn +5 generative credits instantly when verified.", icon: "card_giftcard" },
                { title: "Collaborative Requests", desc: "Looking for a specific midterm paper? Place a request, and let your classmates upload it.", icon: "question_answer" },
                { title: "AI Extraction Loop", desc: "Instantly parse any shared PDF directly into a comprehensive study suite with a single click.", icon: "auto_awesome" },
              ].map((benefit, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">{benefit.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{benefit.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="rounded-2xl font-bold h-11 text-xs px-6 bg-gradient-to-r from-secondary-container to-[#8B5CF6] hover:brightness-110 shadow-lg shadow-secondary/10">
              <Link href="/login">Explore Share Feed</Link>
            </Button>
          </div>

          {/* Right panel: Mock UI Display */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Mock Card Panel */}
            <div className="p-6 rounded-3xl bg-surface-container-low/20 border border-muted-foreground/10 space-y-4 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-muted-foreground/5 pb-3">
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Shared Lecture Papers</span>
                <span className="text-[10px] font-semibold text-[#8B5CF6] hover:underline cursor-pointer">View Library ➔</span>
              </div>

              {/* List of mock documents */}
              <div className="space-y-3">
                {SAMPLE_RESOURCES.map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-3.5 rounded-2xl bg-background/60 border border-muted-foreground/5 flex items-center justify-between gap-4 group hover:border-[#8B5CF6]/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted/50 border border-muted-foreground/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">{doc.icon}</span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-[8px] font-bold px-1.5 py-0 border leading-none ${doc.color}`}>
                            {doc.type}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground font-semibold">{doc.course.split(':')[0]}</span>
                        </div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-muted-foreground font-medium">{doc.size}</span>
                      <div className="w-7 h-7 rounded-lg bg-muted/40 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] flex items-center justify-center text-muted-foreground cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-[14px]">download</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick community metrics widgets */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { count: "2,420+", label: "Shared Papers", desc: "Past questions & summaries" },
                { count: "14,892", label: "Total Downloads", desc: "Peer access rate" },
                { count: "45+", label: "Active Requests", desc: "Fulfillment board" },
              ].map((metric, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface-container-low/10 border border-muted-foreground/5 text-center space-y-1">
                  <span className="text-lg font-extrabold text-foreground tracking-tight block">{metric.count}</span>
                  <span className="text-[9px] text-[#c0c1ff] font-bold block uppercase tracking-wider">{metric.label}</span>
                  <span className="text-[8px] text-muted-foreground block leading-tight">{metric.desc}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
