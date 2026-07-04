"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteStudySet } from "@/actions/study-set";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCategoryIcon } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { StudySetMastery } from "@/components/dashboard/study-set-mastery";
import { NoiseTexture } from "@/components/ui/noise-texture";

export function StudySetCard({ set, isLarge = false }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDeleting(true);
    setIsDeleteConfirmOpen(false);
    const result = await deleteStudySet(set.id);
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to delete study set: " + result.error);
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const sanitizedSummary = set.summary
    ? (typeof set.summary === "string"
        ? set.summary.split('\\n').join('\n')
        : set.summary)
    : "";
  const notesCount = sanitizedSummary
    ? (sanitizedSummary.match(/^##\s+(.+)$/gm)?.length || 0)
    : 0;
  const flashcardsCount = set.flashcards?.[0]?.cards?.length || 0;
  const quizCount = set.quizzes?.[0]?.payload?.length || 0;
  const hasMindmap = !!set.flowcharts?.[0];

  return (
    <>
      <Link href={`/dashboard/workspace?id=${set.id}`} className="block h-full">
        <div 
          className={`group flex flex-col md:flex-row h-full min-h-[220px] rounded-xl bg-app-card border border-app-border hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {/* Subtle hover gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <NoiseTexture className="opacity-[0.02]" />

          {/* Left / Main Section */}
          <div className="flex-1 p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-app-brand/10 flex items-center justify-center text-app-brand overflow-hidden shrink-0">
                  <span className="material-symbols-outlined">
                    {getCategoryIcon(set.category)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 h-5 bg-app-brand/10 text-app-brand border border-app-brand/20 select-none">
                    {set.category || "General"}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-md text-text-muted hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={handleDelete}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-app-brand transition-colors line-clamp-1">{set.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed tracking-wide">
                  {set.description}
                </p>
              </div>
            </div>

            {/* If standard card, render progress bar at the bottom */}
            {!isLarge && (
              <div className="mt-6 pt-4 border-t border-app-border">
                <StudySetMastery studySet={set} />
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4 text-[10px] text-text-muted font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                <span className="font-mono">{new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5 group-hover:text-app-brand transition-colors">
                Study Now
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Right Section: Only visible in Large Bento Cards on desktop */}
          {isLarge && (
            <div className="hidden md:flex w-[200px] border-l border-app-border bg-app-inset/20 p-6 flex-col justify-between shrink-0 z-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Suite Contents</span>
                <div className="space-y-2.5 text-xs text-text-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">style</span>
                      <span>Flashcards</span>
                    </div>
                    <span className="font-bold text-text-primary font-mono">{flashcardsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">quiz</span>
                      <span>Practice Quiz</span>
                    </div>
                    <span className="font-bold text-text-primary font-mono">{quizCount}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-app-border/40">
                <StudySetMastery studySet={set} />
              </div>
            </div>
          )}
        </div>
      </Link>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent 
          className="!w-[90vw] md:!w-[420px] !max-w-none border border-app-border bg-app-card text-text-primary rounded-xl p-6 shadow-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-red-400">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              Delete Study Set?
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-xs leading-relaxed mt-2">
              Are you sure you want to delete <span className="font-bold text-foreground">"{set.title}"</span>? This will permanently erase this study set and all associated notes, flashcards, and quizzes. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteConfirmOpen(false);
              }}
              className="rounded-lg border-app-border text-text-secondary hover:bg-white/5 text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-md font-bold text-xs h-9"
            >
              Delete Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
