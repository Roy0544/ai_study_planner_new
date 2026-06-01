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
import { createFullStudySet } from "@/actions/study-set";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadHandler } from "@/config/client";


export function StudySetCreator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleGenerate = async (data) => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('text', data.text);
      if (data.file) {
        formData.append('file', data.file);
      //  const url =await uploadHandler(data.file)
      }

      console.log("Submitting study set creation request...");
      const response = await createFullStudySet(formData);
      
      if (response.success) {
        console.log("Study set created successfully:", response.data.title);
        setResult(response.data);
        // Optionally redirect to workspace immediately
        // router.push(`/dashboard/workspace/${response.id}`);
      } else {
        console.error("Error generating:", response.error);
        alert(`Failed to generate study set: ${response.error}`);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="relative border-muted/50 overflow-hidden">
      <NoiseTexture className="opacity-[0.05] dark:opacity-[0.1]" />
      <CardHeader className="bg-muted/30 pb-4 relative z-10">
        <CardTitle>Create New Study Set</CardTitle>
        <CardDescription>Upload files or paste text to generate your interactive study suite.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative z-10 space-y-4">
        <div className="w-full">
          <AI_Input_Search 
            placeholder="Paste your notes here or upload a file..."
            searchLabel="Analyze"
            onSubmit={handleGenerate}
          />
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
            <span className="material-symbols-outlined animate-spin">sync</span>
            AI is analyzing your materials and generating your suite...
          </div>
        )}

        {result && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-primary">{result.title}</h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                {result.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{result.description}</p>
            <Button 
              size="sm" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push(`/dashboard/workspace/${result.id}`)}
            >
              Open Workspace
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
