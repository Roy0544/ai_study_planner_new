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
import { CREDIT_COSTS } from "@/lib/credits";


export function StudySetCreator() {
  const [status, setStatus] = useState(null); // null, 'uploading', 'generating'
  const [result, setResult] = useState(null);
  const [creditsModal, setCreditsModal] = useState({ isOpen: false, required: CREDIT_COSTS.study_set, action: "" });
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
            required: CREDIT_COSTS.study_set,
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
      router.push(`/dashboard/workspace?id=${response.data.id}`);
    } catch (err) {
      console.error("Submission failed:", err);
      alert(`Error: ${err.message || "An unexpected error occurred. Please try again."}`);
    } finally {
      setStatus(null);
    }
  };

  return (
    <Card className="relative border border-app-border bg-app-card rounded-xl overflow-hidden shadow-sm">
      <NoiseTexture className="opacity-[0.05] dark:opacity-[0.1]" />
      <CardHeader className="border-b border-app-border bg-app-inset/30 pb-4 relative z-10">
        <CardTitle className="text-text-primary text-xl font-bold">Create New Study Set</CardTitle>
        <CardDescription className="text-text-secondary text-xs">Upload files or paste text to generate your interactive study suite.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative z-10 space-y-4">
        <div className="w-full">
          <AI_Input_Search 
            placeholder="Paste your notes here or upload a file..."
            searchLabel="Analyze"
            costText={`Costs ${CREDIT_COSTS.study_set} credits`}
            onSubmit={handleGenerate}
            disabled={!!status}
          />
        </div>

        {status === 'uploading' && (
          <div className="flex items-center gap-2 text-sm text-blue-500 animate-pulse bg-blue-500/5 p-3 rounded-lg border border-blue-500/20">
            <span className="material-symbols-outlined animate-spin text-blue-500">cloud_upload</span>
            Uploading your material to secure storage...
          </div>
        )}

        {status === 'generating' && (
          <div className="flex items-center gap-2 text-sm text-app-brand animate-pulse bg-app-brand/5 p-3 rounded-lg border border-app-brand/20">
            <span className="material-symbols-outlined animate-spin text-app-brand">auto_awesome</span>
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
            <p className="text-xs text-text-secondary mb-3">{result.description}</p>
            <Button 
              size="sm" 
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 border-none shadow-sm rounded-lg"
              onClick={() => router.push(`/dashboard/workspace?id=${result.id}`)}
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
