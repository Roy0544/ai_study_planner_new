"use client";;
/**
 * @author: @dorianbaffier
 * @description: Card Flip
 * @version: 1.1.0
 * @date: 2026-06-01
 * @license: MIT
 */

import { ArrowRight, Repeat2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CardFlip({
  title = "Design Systems",
  subtitle = "Explore the fundamentals",
  description = "Dive deep into the world of modern UI/UX design.",
  features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
  onFlip
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const nextFlippedState = !isFlipped;
    setIsFlipped(nextFlippedState);
    if (nextFlippedState && onFlip) {
      onFlip();
    }
  };

  return (
    <div
      className="group relative h-[320px] w-full max-w-[280px] [perspective:2000px] cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}>
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-2xl",
            "bg-zinc-50 dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800/50",
            "shadow-xs dark:shadow-lg",
            "transition-all duration-700",
            "group-hover:shadow-lg dark:group-hover:shadow-xl",
            isFlipped ? "opacity-0" : "opacity-100"
          )}>
          <div
            className="relative h-full overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black">
            <div className="absolute inset-0 flex items-start justify-center pt-12">
              <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                {[...Array(10)].map((_, i) => (
                  <div
                    className={cn(
                      "absolute h-[50px] w-[50px]",
                      "rounded-[140px]",
                      "animate-[scale_3s_linear_infinite]",
                      "opacity-0",
                      "shadow-[0_0_50px_rgba(255,165,0,0.5)]",
                      "group-hover:animate-[scale_2s_linear_infinite]"
                    )}
                    key={i}
                    style={{
                      animationDelay: `${i * 0.3}s`,
                    }} />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <h3
                  className="font-semibold text-lg text-zinc-900 leading-snug tracking-tighter dark:text-white">
                  {title}
                </h3>
                <p
                  className="text-sm text-zinc-600 tracking-tight dark:text-zinc-200 overflow-y-auto max-h-[120px] custom-scrollbar">
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative shrink-0">
                <div
                  className={cn(
                    "absolute inset-[-8px] rounded-lg transition-opacity duration-300",
                    "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent"
                  )} />
                <Repeat2
                  className="relative z-10 h-4 w-4 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-2xl p-6",
            "bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-xs dark:shadow-lg",
            "flex flex-col",
            "transition-all duration-700",
            "group-hover:shadow-lg dark:group-hover:shadow-xl",
            isFlipped ? "opacity-100" : "opacity-0"
          )}>
          <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
            <div className="space-y-2 shrink-0">
              <h3
                className="font-semibold text-lg text-zinc-900 leading-snug tracking-tight dark:text-white">
                {title}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
               {description && (
                  <p className="text-sm text-zinc-600 tracking-tight dark:text-zinc-400">
                    {description}
                  </p>
               )}
               <div className="space-y-2">
                 {features.map((feature, index) => (
                   <div
                     className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                     key={index}
                   >
                     <ArrowRight className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
                     <span>{feature}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="mt-4 border-zinc-200 border-t pt-4 dark:border-zinc-800 shrink-0">
            <div
              className={cn(
                "group/start relative",
                "flex items-center justify-between",
                "-m-3 rounded-xl p-3",
                "transition-all duration-300",
                "bg-zinc-100 dark:bg-zinc-800",
                "hover:bg-orange-500/10"
              )}>
              <span
                className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                Click to flip back
              </span>
              <Repeat2 className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
                @keyframes scale {
                    0% {
                        transform: scale(2);
                        opacity: 0;
                        box-shadow: 0px 0px 50px rgba(255, 165, 0, 0.5);
                    }
                    50% {
                        transform: translate(0px, -5px) scale(1);
                        opacity: 1;
                        box-shadow: 0px 8px 20px rgba(255, 165, 0, 0.5);
                    }
                    100% {
                        transform: translate(0px, 5px) scale(0.1);
                        opacity: 0;
                        box-shadow: 0px 10px 20px rgba(255, 165, 0, 0);
                    }
                }
            `}</style>
    </div>
  );
}
