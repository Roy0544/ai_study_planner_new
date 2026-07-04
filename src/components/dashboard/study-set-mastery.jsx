"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function StudySetMastery({ studySet }) {
  const [mastery, setMastery] = useState(0);

  useEffect(() => {
    if (!studySet) return;
    
    try {
      const savedState = localStorage.getItem(`masteryState-${studySet.id}`);
      if (!savedState) {
        setMastery(0);
        return;
      }
      
      const parsed = JSON.parse(savedState);
      const checkedSections = parsed.checkedSections || [];
      const mindmapsViewed = !!parsed.mindmapsViewed;
      const flashcardsFlipped = parsed.flashcardsFlipped || [];
      const quizAnswers = parsed.quizAnswers || {};

      let score = 0;
      
      // 1. Notes (25%)
      const totalNotesSections = studySet.materials?.notes?.length || 0;
      if (totalNotesSections > 0) {
        score += (checkedSections.length / totalNotesSections) * 25;
      }
      
      // 2. Mindmaps (25%)
      if (mindmapsViewed) score += 25;
      
      // 3. Flashcards (25%)
      const totalFlashcards = studySet.materials?.flashcards?.length || 0;
      if (totalFlashcards > 0) {
        score += (flashcardsFlipped.length / totalFlashcards) * 25;
      }
      
      // 4. Quiz (25%)
      const totalQuizQuestions = studySet.materials?.quiz?.length || 0;
      if (totalQuizQuestions > 0) {
        const correctAnswersCount = Object.values(quizAnswers).filter(a => a.isCorrect).length;
        score += (correctAnswersCount / totalQuizQuestions) * 25;
      }
      
      setMastery(Math.min(100, Math.max(0, Math.round(score))));
    } catch (e) {
      console.error("Failed to load study set mastery:", e);
    }
  }, [studySet]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-text-secondary">Mastery</span>
        <span className="text-emerald-400 font-bold">{mastery}%</span>
      </div>
      <Progress value={mastery} className="h-1.5" indicatorClassName="bg-emerald-500" />
    </div>
  );
}
