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
import { InsufficientCreditsModal } from "@/components/dashboard/insufficient-credits-modal";


export function StudySetCreator() {
  const [status, setStatus] = useState(null); // null, 'uploading', 'generating'
  const [result, setResult] = useState(null);
  const [creditsModal, setCreditsModal] = useState({ isOpen: false, required: 5, action: "" });
  const router = useRouter();

  const handleGenerate = async (data) => {
    setResult(null);
    
    try {
      let fileUrl = null;
      
      // 1. Upload File if present
      if (data.file) {
        setStatus('uploading');
        const uploadResponse = await uploadHandler(data.file);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error || "File upload failed");
        }
        fileUrl = uploadResponse.url;
      }

      // 2. Generate Study Set
      setStatus('generating');
      const formData = new FormData();
      formData.append('text', data.text);
      if (fileUrl) {
        formData.append('fileUrl', fileUrl); // Send the URL instead of the file
      }

      console.log("Submitting study set creation request...");
      const response = await createFullStudySet(formData);
      if (!response.success) {
        if (response.insufficientCredits) {
          setCreditsModal({
            isOpen: true,
            required: 5,
            action: "Create Study Set"
          });
        } else {
          alert(response.error);
        }
        return;
      }
      console.log("Study set created successfully:", response.data.title);
      setResult(response.data);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (err) {
      console.error("Submission failed:", err);
      alert(`Error: ${err.message || "An unexpected error occurred. Please try again."}`);
    } finally {
      setStatus(null);
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
            disabled={!!status}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-right px-1 flex items-center justify-end gap-1 select-none">
          <span className="material-symbols-outlined text-[12px] text-primary">toll</span>
          Generating a full suite costs 5 credits
        </p>

        {status === 'uploading' && (
          <div className="flex items-center gap-2 text-sm text-blue-500 animate-pulse bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
            <span className="material-symbols-outlined animate-spin text-blue-500">cloud_upload</span>
            Uploading your material to secure storage...
          </div>
        )}

        {status === 'generating' && (
          <div className="flex items-center gap-2 text-sm text-primary animate-pulse bg-primary/5 p-3 rounded-xl border border-primary/20">
            <span className="material-symbols-outlined animate-spin text-primary">auto_awesome</span>
            AI is analyzing your materials and generating your suite...
          </div>
        )}

        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400">{result.title}</h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                {result.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{result.description}</p>
            <Button 
              size="sm" 
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
              onClick={() => router.push(`/dashboard/workspace/${result.id}`)}
            >
              Open Workspace
            </Button>
          </div>
        )}

        <InsufficientCreditsModal
          isOpen={creditsModal.isOpen}
          onClose={() => setCreditsModal(prev => ({ ...prev, isOpen: false }))}
          requiredCredits={creditsModal.required}
          actionName={creditsModal.action}
        />
      </CardContent>
    </Card>
  );
}
