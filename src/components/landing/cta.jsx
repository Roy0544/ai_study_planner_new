"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <Card className="bg-primary text-primary-foreground p-12 overflow-hidden relative border-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to transform your study routine?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Join thousands of students and researchers who are learning 3x faster with StudyAI.
          </p>
          <RainbowButton asChild className="px-10 font-bold h-14 text-lg">
            <Link href="/login">Create Free Account</Link>
          </RainbowButton>
        </div>
      </Card>
    </section>
  );
}
