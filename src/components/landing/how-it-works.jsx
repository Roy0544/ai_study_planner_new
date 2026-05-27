"use client";

import { WorkflowBeam } from "@/components/workflow-beam";
import { KineticText } from "@/components/ui/kinetic-text";

export function HowItWorks() {
  return (
    <section className="py-24 border-t bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <KineticText 
            text="Three Simple Steps" 
            as="h2" 
            className="text-3xl md:text-5xl font-bold mb-4 justify-center mx-auto" 
          />
          <p className="text-muted-foreground text-lg">From raw documents to expert knowledge.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <WorkflowBeam className="py-12" showLabels={false} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 px-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">1. Upload</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop your PDFs, lecture notes, or research papers into the dash.
              </p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-primary">2. Synthesize</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI engine analyzes and structures your material instantly.
              </p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">3. Learn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start practicing with adaptive quizzes and interactive diagrams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
