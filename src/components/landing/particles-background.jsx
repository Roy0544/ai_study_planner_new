"use client";

import { Particles } from "@/components/ui/particles";

export function ParticlesBackground() {
  return (
    <Particles
      className="absolute inset-0 z-0 pointer-events-none"
      quantity={150}
      ease={80}
      color="#ffffff"
      refresh
    />
  );
}
