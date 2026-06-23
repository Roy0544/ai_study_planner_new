"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

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
    </section>
  );
}
