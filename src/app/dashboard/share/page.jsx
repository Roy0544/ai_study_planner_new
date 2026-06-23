"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SharingHubComingSoon() {
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setRegistered(true);
    setEmail("");
    setTimeout(() => setRegistered(false), 5000);
  };

  const upcomingFeatures = [
    {
      icon: "description",
      title: "Lecture Notes Hub",
      description: "Upload and download comprehensive lecture notes and semester-wise study material shared by peers.",
    },
    {
      icon: "quiz",
      title: "Past Exam Papers",
      description: "Access a structured repository of previous years' midterm tests, final exams, and lab question papers.",
    },
    {
      icon: "forum",
      title: "Request Board",
      description: "Ask the community for specific course materials or fulfill open requests to earn bonus credits.",
    },
    {
      icon: "auto_awesome",
      title: "One-Click AI Synthesis",
      description: "Convert shared PDFs directly into personalized flashcard decks, interactive mindmaps, and quizzes.",
    },
  ];

  return (
    <main className="p-6 min-h-[85vh] flex flex-col justify-center items-center max-w-5xl mx-auto w-full relative">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Wrapper */}
      <Card className="w-full bg-transparent border-muted/50 rounded-3xl relative overflow-hidden backdrop-blur-md p-8 md:p-12 shadow-2xl flex flex-col items-center">
        {/* Decorative inner pattern */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
          <Badge className="bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 uppercase tracking-widest text-[9px] font-extrabold px-3.5 py-1 animate-pulse">
            Upcoming Expansion Module
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground via-[#c0c1ff] to-[#8B5CF6] bg-clip-text text-transparent leading-tight text-center">
            GKVK Notes & Papers Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-center">
            We are building a centralized community hub where GKVK agricultural scholars can share notes, download past exam archives, request materials, and synthesize shared assets with our core study engine.
          </p>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl my-10">
          {upcomingFeatures.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-muted/20 border border-muted-foreground/10 flex items-start gap-4 hover:border-[#8B5CF6]/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-[#8B5CF6]/10 group-hover:text-[#8B5CF6] transition-colors">
                <span className="material-symbols-outlined text-[20px]">{feat.icon}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Panel / Waitlist Form */}
        <div className="w-full space-y-4 text-center mt-4">
          <p className="text-xs text-muted-foreground font-semibold">Join the waitlist to receive instant notifications and early access rewards.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
            <Input
              type="email"
              placeholder="Enter your university email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-[#8B5CF6] h-11 text-xs text-center rounded-xl flex-1"
            />
            <Button
              type="submit"
              className="rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 h-11 text-xs px-6 shrink-0"
            >
              Subscribe
            </Button>
          </form>

          <AnimatePresence>
            {registered && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Thank you! You have been successfully added to our early access queue.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Navigation Button */}
        <div className="mt-12 border-t border-muted-foreground/10 pt-6 w-full flex justify-center">
          <Button asChild variant="outline" className="rounded-xl h-10 px-6 text-xs text-muted-foreground border-muted-foreground/20 hover:text-foreground">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Study Dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
