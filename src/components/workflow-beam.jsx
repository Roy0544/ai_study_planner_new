"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:bg-black border-primary/20",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function WorkflowBeam({ className, showLabels = true, activeStep = null }) {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        className,
      )}
      ref={containerRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 flex items-center justify-center">
            <Circle 
              ref={div1Ref}
              className={cn(
                "transition-all duration-300 border-primary/20 bg-app-card",
                activeStep === 1 ? "scale-110 border-app-brand bg-app-brand/10 shadow-[0_0_15px_rgba(96,165,250,0.4)]" : ""
              )}
            >
              <span className={cn("material-symbols-outlined transition-colors", activeStep === 1 ? "text-app-brand font-bold" : "text-text-secondary")}>cloud_upload</span>
            </Circle>
          </div>
          {showLabels && <span className="text-xs font-medium">Upload</span>}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 flex items-center justify-center">
            <Circle 
              ref={div2Ref} 
              className={cn(
                "h-16 w-16 transition-all duration-300 border-primary/20 bg-app-card",
                activeStep === 2 ? "scale-110 border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.4)]" : ""
              )}
            >
              <span className={cn("material-symbols-outlined text-3xl transition-colors", activeStep === 2 ? "text-purple-400 font-bold" : "text-text-secondary")}>auto_awesome</span>
            </Circle>
          </div>
          {showLabels && <span className="text-xs font-bold text-primary">Synthesize</span>}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 flex items-center justify-center">
            <Circle 
              ref={div3Ref}
              className={cn(
                "transition-all duration-300 border-primary/20 bg-app-card",
                activeStep === 3 ? "scale-110 border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : ""
              )}
            >
              <span className={cn("material-symbols-outlined transition-colors", activeStep === 3 ? "text-emerald-400 font-bold" : "text-text-secondary")}>school</span>
            </Circle>
          </div>
          {showLabels && <span className="text-xs font-medium">Learn</span>}
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div3Ref}
        duration={3}
      />
    </div>
  );
}
