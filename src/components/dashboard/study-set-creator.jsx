"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NoiseTexture } from "@/components/ui/noise-texture";
import AI_Input_Search from "@/components/kokonutui/ai-input-search";

export function StudySetCreator() {
  return (
    <Card className="relative border-muted/50 overflow-hidden">
      <NoiseTexture className="opacity-[0.05] dark:opacity-[0.1]" />
      <CardHeader className="bg-muted/30 pb-4 relative z-10">
        <CardTitle>Create New Study Set</CardTitle>
        <CardDescription>Upload files or paste text to generate your interactive study suite.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        <div className="w-full">
          <AI_Input_Search 
            placeholder="Paste your notes here or upload a file..."
            searchLabel="Analyze"
            onSubmit={(value) => console.log('AI Input submitted:', value)}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg" className="gap-2 shadow-lg bg-[#8B5CF6] text-secondary-foreground shadow-secondary/20 hover:bg-black hover:text-secondary  h-12 px-8 rounded-xl font-bold transition-all">
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate Study Suite
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
