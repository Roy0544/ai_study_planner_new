"use client";

import { WorkflowBeam } from "@/components/workflow-beam";

export function JourneyBeam() {
  return (
    <section className="bg-muted/20 rounded-2xl border border-muted-foreground/10 overflow-hidden">
      <div className="px-6 pt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Your Learning Journey</h3>
          <p className="text-sm text-muted-foreground">See how StudyAI transforms your materials.</p>
        </div>
      </div>
      <WorkflowBeam className="py-12" />
    </section>
  );
}
