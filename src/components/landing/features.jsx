"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { KineticText } from "@/components/ui/kinetic-text";

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24 border-t">
      <div className="text-center mb-16">
        <KineticText 
          text="Powerful Study Tools" 
          as="h2" 
          className="text-3xl md:text-5xl font-bold mb-4 justify-center mx-auto" 
        />
        <p className="text-muted-foreground text-lg">Everything you need to master your subjects in record time.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">quiz</span>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Interactive Quizzes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI generates practice questions based on your specific content, focusing on areas where you need improvement.
            </p>
          </div>
        </MagicCard>

        <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">style</span>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Smart Flashcards</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Key concepts are automatically extracted and turned into digital flashcards ready for active recall.
            </p>
          </div>
        </MagicCard>

        <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Structured Notes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No more scrolling through hundreds of PDF pages. Get a concise, beautifully formatted summary of the essentials.
            </p>
          </div>
        </MagicCard>

        <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">account_tree</span>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">AI Flowcharts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complex processes are transformed into clear visual diagrams, making logical connections obvious.
            </p>
          </div>
        </MagicCard>
      </div>
    </section>
  );
}
