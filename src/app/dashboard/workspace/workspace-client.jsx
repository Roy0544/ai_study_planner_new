"use client";

import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import CardFlip from "@/components/kokonutui/card-flip";
import { MermaidDiagram } from "@/components/ui/mermaid-diagram";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams,useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { fetchStudySetById, generateFlashcards, generateQuiz, generateMindMap, generateQuickNote } from "@/actions/study-set";
import { getCategoryIcon, cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Suspense } from "react";
import { InsufficientCreditsModal } from "@/components/dashboard/insufficient-credits-modal";
import { CREDIT_COSTS } from "@/lib/credits";

export function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();     
  const setId = searchParams.get("id");
  
  const [studySet, setStudySet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // 'notes', 'flashcards', etc.
  const [creditsModal, setCreditsModal] = useState({ isOpen: false, required: CREDIT_COSTS.flashcards, action: "" });

  // Mastery Tracking State
  const [checkedSections, setCheckedSections] = useState([]);
  const [mindmapsViewed, setMindmapsViewed] = useState(false);
  const [flashcardsFlipped, setFlashcardsFlipped] = useState([]);

  // Notes Pagination State
  const [currentNotePage, setCurrentNotePage] = useState(0);

  // Flashcards Pagination State
  const [currentFlashcardPage, setCurrentFlashcardPage] = useState(0);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [learningNotes, setLearningNotes] = useState({});
  const [currentQuizResultPage, setCurrentQuizResultPage] = useState(0);

  const sanitizedSummary = useMemo(() => {
    if (!studySet?.summary) return "";
    return typeof studySet.summary === "string"
      ? studySet.summary.split('\\n').join('\n')
      : studySet.summary;
  }, [studySet?.summary]);

  const totalNotesSections = useMemo(() => {
    if (!sanitizedSummary) return 0;
    const matches = sanitizedSummary.match(/^##\s+(.+)$/gm);
    return matches ? matches.length : 0;
  }, [sanitizedSummary]);

  const noteChapters = useMemo(() => {
    if (!sanitizedSummary) return [];
    // Split by "## " but keep the delimiter
    const parts = sanitizedSummary.split(/(?=^##\s+)/m);
    return parts.filter(p => p.trim() !== "");
  }, [sanitizedSummary]);

  useEffect(() => {
    if (setId) {
      const savedState = localStorage.getItem(`masteryState-${setId}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setCurrentQuizIndex(parsed.currentQuizIndex || 0);
          setQuizAnswers(parsed.quizAnswers || {});
          setShowQuizResult(parsed.showQuizResult || false);
          setCheckedSections(parsed.checkedSections || []);
          setMindmapsViewed(parsed.mindmapsViewed || false);
          setFlashcardsFlipped(parsed.flashcardsFlipped || []);
          setCurrentNotePage(parsed.currentNotePage || 0);
          setCurrentFlashcardPage(parsed.currentFlashcardPage || 0);
          setCurrentQuizResultPage(parsed.currentQuizResultPage || 0);
        } catch (e) {
          console.error("Failed to load saved mastery state", e);
        }
      }
    }
  }, [setId]);

  useEffect(() => {
    if (setId) {
      const stateToSave = {
        currentQuizIndex,
        quizAnswers,
        showQuizResult,
        checkedSections,
        mindmapsViewed,
        flashcardsFlipped,
        currentNotePage,
        currentFlashcardPage,
        currentQuizResultPage
      };
      
      const hasProgress = Object.keys(quizAnswers).length > 0 || currentQuizIndex > 0 || showQuizResult || checkedSections.length > 0 || mindmapsViewed || flashcardsFlipped.length > 0 || currentNotePage > 0 || currentFlashcardPage > 0;

      if (!hasProgress) {
        localStorage.removeItem(`masteryState-${setId}`);
      } else {
        localStorage.setItem(`masteryState-${setId}`, JSON.stringify(stateToSave));
      }
    }
  }, [currentQuizIndex, quizAnswers, showQuizResult, checkedSections, mindmapsViewed, flashcardsFlipped, currentNotePage, currentFlashcardPage, currentQuizResultPage, setId]);

  const overallMastery = useMemo(() => {
    let score = 0;
    
    // Notes (25%)
    if (totalNotesSections > 0) {
      score += (checkedSections.length / totalNotesSections) * 25;
    }
    
    // Mindmaps (25%)
    if (mindmapsViewed) score += 25;
    
    // Flashcards (25%)
    if (studySet?.flashcards?.length > 0) {
       score += (flashcardsFlipped.length / studySet.flashcards.length) * 25;
    }
    
    // Quiz (25%)
    if (studySet?.quiz?.length > 0) {
       const correctAnswersCount = Object.values(quizAnswers).filter(a => a.isCorrect).length;
       score += (correctAnswersCount / studySet.quiz.length) * 25;
    }
    
    return Math.round(score);
  }, [checkedSections, totalNotesSections, mindmapsViewed, flashcardsFlipped, quizAnswers, studySet]);

  const handleLearnMore = async (index, question, answer) => {
    if (learningNotes[index]) return;
    setLearningNotes(prev => ({ ...prev, [index]: { loading: true, note: null } }));
    
    const content = studySet.materials?.input_prompt || studySet.summary;
    const result = await generateQuickNote(question, answer, content);
    
    setLearningNotes(prev => ({ 
      ...prev, 
      [index]: { loading: false, note: result.success ? result.data : "Failed to load note." } 
    }));
  };

  useEffect(() => {
    if (setId) {
      loadStudySet();
    }
  }, [setId]);

  const loadStudySet = async () => {
    setLoading(true);
    const result = await fetchStudySetById(setId);
    if (result.success) {
      setStudySet(result.data);
    }
    setLoading(false);
  };

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      let result;
      const content = studySet.materials?.input_prompt || studySet.summary;
      const fileUrl = studySet.materials?.file_url;
      
      
      if (type === 'flashcards') {
        result = await generateFlashcards(setId, content, fileUrl);
      } else if (type === 'quiz') {
        result = await generateQuiz(setId, content, fileUrl);
      } else if (type === 'mindmaps') {
        result = await generateMindMap(setId, content, fileUrl);
      }
      
      if (result?.success) {
        setStudySet(prev => ({ ...prev, [type]: result.data }));
        window.dispatchEvent(new Event("credits-updated"));
      } else {
        if (result?.insufficientCredits) {
          const reqVal = type === 'mindmaps' ? CREDIT_COSTS.mindmap : CREDIT_COSTS[type];
          setCreditsModal({
            isOpen: true,
            required: reqVal,
            action: type === 'flashcards' ? "Generate Flashcards" : type === 'quiz' ? "Generate Quiz" : "Generate Mind Map"
          });
        } else {
          alert(result?.error || "An error occurred during generation.");
        }
      }
    }catch (err) {
          console.error("Failed to generate:", err);
          alert("Failed to connect to the server.");
    }
     finally {
      setGenerating(null);
    }
  };

  const workspaceTabs = useMemo(() => {
    if (!studySet) return [];
    
    const totalFlashcardPages = studySet.flashcards ? Math.ceil(studySet.flashcards.length / 6) : 0;

    return [
      {
        id: "notes",
        title: "Concise Notes",
        description: "Quick summary of key concepts",
        color: "bg-blue-500",
        content: (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-8">
              <MarkdownRenderer 
                content={noteChapters[currentNotePage] || sanitizedSummary} 
                className="max-w-3xl mx-auto pb-12"
                checkedSections={checkedSections}
                onToggleSection={(sectionTitle) => {
                  setCheckedSections(prev => 
                    prev.includes(sectionTitle) 
                      ? prev.filter(t => t !== sectionTitle)
                      : [...prev, sectionTitle]
                  );
                }}
              />
            </ScrollArea>
            
            {noteChapters.length > 1 && (
              <div className="p-4 border-t border-border/50 flex items-center justify-center bg-muted/20 shrink-0">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentNotePage > 0) setCurrentNotePage(prev => prev - 1);
                        }}
                        className={cn(currentNotePage === 0 && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                    
                    {noteChapters.map((_, idx) => (
                      <PaginationItem key={idx} className="hidden md:inline-block">
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentNotePage(idx);
                          }}
                          isActive={currentNotePage === idx}
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentNotePage < noteChapters.length - 1) setCurrentNotePage(prev => prev + 1);
                        }}
                        className={cn(currentNotePage === noteChapters.length - 1 && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )
      },
      {
        id: "flashcards",
        title: "Flashcards",
        description: "Test your memory",
        color: "bg-purple-500",
        content: (
          <div className="h-full flex flex-col">
            {!studySet.flashcards ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-8 flex flex-col items-center justify-center w-full max-w-[665px]  mx-auto ">
                  <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0  ">
                    <span className="material-symbols-outlined text-5xl text-purple-500">style</span>
                  </div>
                  <div className="space-y-3 w-full text-center">
                    <h3 className="text-2xl font-bold tracking-tight">Generate Flashcards</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      Turn your study materials into interactive, AI-powered flashcards for efficient active recall.
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleGenerate('flashcards')} 
                    disabled={!!generating}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold px-10 h-12 shrink-0 min-w-[220px] shadow-lg shadow-purple-500/20 text-base"
                  >
                    {generating === 'flashcards' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Generate Cards ({CREDIT_COSTS.flashcards} Credits)
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-8 pt-4 flex justify-end items-center shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerate('flashcards')} 
                    disabled={!!generating}
                    className="rounded-lg shadow-sm border-purple-500/20 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600"
                  >
                    {generating === 'flashcards' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="material-symbols-outlined text-[16px] mr-1.5">refresh</span>}
                    Regenerate ({CREDIT_COSTS.flashcards} Credits)
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-8">
                  <div className="max-w-5xl mx-auto pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                       {studySet.flashcards
                         .slice(currentFlashcardPage * 6, (currentFlashcardPage + 1) * 6)
                         .map((card, i) => {
                           const actualIndex = currentFlashcardPage * 6 + i;
                           return (
                             <CardFlip 
                                key={actualIndex}
                                title={`Card ${actualIndex + 1}`}
                                subtitle={card.question}
                                description="Answer:"
                                features={[card.answer]}
                                onFlip={() => {
                                  setFlashcardsFlipped(prev => {
                                    if (!prev.includes(actualIndex)) {
                                      return [...prev, actualIndex];
                                    }
                                    return prev;
                                  });
                                }}
                             />
                           );
                       })}
                    </div>
                  </div>
                </ScrollArea>

                {studySet.flashcards.length > 6 && (
                  <div className="p-4 border-t border-border/50 flex items-center justify-center bg-muted/20 shrink-0">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentFlashcardPage > 0) setCurrentFlashcardPage(prev => prev - 1);
                            }}
                            className={cn(currentFlashcardPage === 0 && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.ceil(studySet.flashcards.length / 6) }).map((_, idx) => (
                          <PaginationItem key={idx} className="hidden md:inline-block">
                            <PaginationLink 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentFlashcardPage(idx);
                              }}
                              isActive={currentFlashcardPage === idx}
                            >
                              {idx + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentFlashcardPage < totalFlashcardPages - 1) {
                                setCurrentFlashcardPage(prev => prev + 1);
                              }
                            }}
                            className={cn(currentFlashcardPage >= totalFlashcardPages - 1 && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        )
      },
      {
        id: "mindmaps",
        title: "Mind Maps",
        description: "Visual concept connections",
        color: "bg-emerald-500",
        content: (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-6 rounded-xl">
             {!studySet.mindmaps ? (
               <div className="text-center space-y-8 flex flex-col items-center justify-center w-full max-w-[665px] mx-auto">
                 <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                    <span className="material-symbols-outlined text-5xl">account_tree</span>
                 </div>
                 <div className="space-y-3 w-full text-center">
                   <h3 className="text-2xl font-bold tracking-tight">Generate Mind Map</h3>
                   <p className="text-muted-foreground text-base leading-relaxed">
                     Visualize connections between concepts with an AI-generated mind map.
                   </p>
                 </div>
                 <Button 
                   onClick={() => handleGenerate('mindmaps')} 
                   disabled={!!generating}
                   className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-10 h-12 shrink-0 min-w-[220px] shadow-lg shadow-emerald-500/20 text-base"
                 >
                   {generating === 'mindmaps' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                   Generate Mind Map ({CREDIT_COSTS.mindmap} Credits)
                 </Button>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col relative" onMouseEnter={() => setMindmapsViewed(true)} onTouchStart={() => setMindmapsViewed(true)}>
                 <div className="absolute top-4 left-4 z-10">
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => handleGenerate('mindmaps')} 
                     disabled={!!generating}
                     className="rounded-lg shadow-sm border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                   >
                     {generating === 'mindmaps' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="material-symbols-outlined text-[16px] mr-1.5">refresh</span>}
                     Regenerate ({CREDIT_COSTS.mindmap} Credits)
                   </Button>
                 </div>
                 <MermaidDiagram chart={studySet.mindmaps} />
               </div>
             )}
          </div>
        )
      },
      {
        id: "quiz",
        title: "Quiz",
        description: "Practice exam mode",
        color: "bg-amber-500",
        content: (
          <div className={cn("h-full flex flex-col p-6", !studySet.quiz && "items-center justify-center")}>
            {!studySet.quiz ? (
              <div className="text-center space-y-6 flex flex-col items-center justify-center w-full max-w-[666px] mx-auto">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-4xl text-amber-500">quiz</span>
                </div>
                <div className="space-y-2 w-full flex flex-col items-center">
                  <h3 className="text-xl font-bold tracking-tight text-center w-full">Create practice quiz</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-center w-full max-w-[666px]">
                    AI will generate a personalized assessment for you.
                  </p>
                </div>
                <Button 
                  onClick={() => handleGenerate('quiz')} 
                  disabled={!!generating}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold px-8 h-11 shrink-0 min-w-[180px]"
                >
                  {generating === 'quiz' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Quiz ({CREDIT_COSTS.quiz} Credits)
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center shrink-0 pb-4 border-b border-border/50 mb-4">
                  <span className="text-xs text-muted-foreground font-semibold text-amber-500">
                    Practice Quiz Assessment
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCurrentQuizIndex(0);
                      setQuizAnswers({});
                      setShowQuizResult(false);
                      setCurrentQuizResultPage(0);
                      handleGenerate('quiz');
                    }} 
                    disabled={!!generating}
                    className="rounded-lg shadow-sm border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600"
                  >
                    {generating === 'quiz' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="material-symbols-outlined text-[16px] mr-1.5">refresh</span>}
                    Regenerate ({CREDIT_COSTS.quiz} Credits)
                  </Button>
                </div>
                <ScrollArea className="flex-1 w-full">
                  <div className="p-8 pt-2">
                  {showQuizResult ? (
                    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 text-center pb-12">
                      <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                      <div className="text-6xl font-bold text-amber-500">
                        {Object.values(quizAnswers).filter(a => a.isCorrect).length} / {studySet.quiz.length}
                      </div>
                      <p className="text-muted-foreground">Great job! Review your performance or try again.</p>
                      <Button 
                        onClick={() => {
                          setCurrentQuizIndex(0);
                          setQuizAnswers({});
                          setShowQuizResult(false);
                          setCurrentQuizResultPage(0);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold px-8 h-11 shrink-0"
                      >
                        Restart Quiz
                      </Button>

                      {(() => {
                        const incorrectAnswers = Object.entries(quizAnswers).filter(([_, a]) => !a.isCorrect);
                        const itemsPerPage = 3;
                        const totalResultPages = Math.ceil(incorrectAnswers.length / itemsPerPage);
                        const displayedAnswers = incorrectAnswers.slice(currentQuizResultPage * itemsPerPage, (currentQuizResultPage + 1) * itemsPerPage);

                        if (incorrectAnswers.length === 0) return null;

                        return (
                          <div className="w-full mt-12 space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Separator className="bg-muted-foreground/20" />
                            <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 pt-4">
                               <span className="material-symbols-outlined">error</span>
                               Review Incorrect Answers
                            </h3>
                            <div className="space-y-6">
                               {displayedAnswers.map(([index, a]) => {
                                   const q = studySet.quiz[index];
                                   return (
                                     <div key={index} className="bg-muted/20 p-6 rounded-2xl border border-muted-foreground/10 space-y-4">
                                       <div className="space-y-2">
                                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Question {parseInt(index) + 1}</span>
                                         <h4 className="text-lg font-bold leading-snug">{q.question}</h4>
                                       </div>
                                       <div className="grid gap-2 text-sm pt-2">
                                          <div className="flex gap-2 items-start text-red-500/90">
                                            <span className="font-bold shrink-0">Your Answer:</span>
                                            <span className="font-medium whitespace-normal">{a.selected}</span>
                                          </div>
                                          <div className="flex gap-2 items-start text-emerald-500">
                                            <span className="font-bold shrink-0">Correct Answer:</span>
                                            <span className="font-medium whitespace-normal">{q.answer}</span>
                                          </div>
                                       </div>
                                       <div className="bg-background/50 p-4 rounded-xl border border-border text-sm text-muted-foreground mt-4 space-y-4">
                                          <div>
                                            <span className="font-bold text-foreground block mb-1">Explanation:</span>
                                            <p className="leading-relaxed whitespace-normal">{q.explanation}</p>
                                          </div>
                                          
                                          {!learningNotes[index] ? (
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="text-xs h-8 rounded-lg border-muted-foreground/20 hover:border-amber-500/50 hover:text-amber-500"
                                              onClick={() => handleLearnMore(index, q.question, q.answer)}
                                            >
                                              <span className="material-symbols-outlined mr-2 text-[14px]">psychology</span>
                                              Learn More
                                            </Button>
                                          ) : learningNotes[index].loading ? (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                              Generating study note...
                                            </div>
                                          ) : (
                                            <div className="pt-2 border-t border-muted-foreground/10">
                                              <span className="font-bold text-amber-500 flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                                                AI Study Note
                                              </span>
                                              <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none">
                                                <MarkdownRenderer content={learningNotes[index].note} />
                                              </div>
                                            </div>
                                          )}
                                       </div>
                                     </div>
                                   );
                               })}
                            </div>

                            {totalResultPages > 1 && (
                              <div className="pt-8 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        href="#" 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (currentQuizResultPage > 0) setCurrentQuizResultPage(prev => prev - 1);
                                        }}
                                        className={cn(currentQuizResultPage === 0 && "pointer-events-none opacity-50")}
                                      />
                                    </PaginationItem>
                                    
                                    {Array.from({ length: totalResultPages }).map((_, idx) => (
                                      <PaginationItem key={idx} className="hidden md:inline-block">
                                        <PaginationLink 
                                          href="#" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentQuizResultPage(idx);
                                          }}
                                          isActive={currentQuizResultPage === idx}
                                        >
                                          {idx + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                      <PaginationNext 
                                        href="#" 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (currentQuizResultPage < totalResultPages - 1) {
                                            setCurrentQuizResultPage(prev => prev + 1);
                                          }
                                        }}
                                        className={cn(currentQuizResultPage >= totalResultPages - 1 && "pointer-events-none opacity-50")}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-8 pb-12">
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-muted-foreground">Question {currentQuizIndex + 1} of {studySet.quiz.length}</span>
                          <span className="text-sm font-bold text-amber-500">Score: {Object.values(quizAnswers).filter(a => a.isCorrect).length}</span>
                       </div>
                       <Progress value={((currentQuizIndex) / studySet.quiz.length) * 100} className="h-2 mb-8 bg-muted" indicatorClassName="bg-amber-500" />
                       
                       {studySet.quiz[currentQuizIndex] && (() => {
                          const q = studySet.quiz[currentQuizIndex];
                          const hasAnswered = !!quizAnswers[currentQuizIndex];
                          const selectedAnswer = hasAnswered ? quizAnswers[currentQuizIndex].selected : null;

                          return (
                            <div className="space-y-6">
                              <h3 className="text-xl font-bold leading-tight">{q.question}</h3>
                              <div className="grid gap-3">
                                {q.options.map((option, idx) => {
                                  let buttonVariant = "outline";
                                  let buttonClass = "justify-start h-auto p-4 text-left rounded-xl border-muted-foreground/10 shrink-0 whitespace-normal break-words ";
                                  
                                  if (hasAnswered) {
                                    if (option === q.answer) {
                                      buttonVariant = "default";
                                      buttonClass += "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500";
                                    } else if (option === selectedAnswer) {
                                      buttonVariant = "destructive";
                                      buttonClass += "opacity-80";
                                    } else {
                                      buttonClass += "opacity-50";
                                    }
                                  } else {
                                    buttonClass += "hover:border-amber-500/50";
                                  }

                                  return (
                                    <Button 
                                      key={idx} 
                                      variant={buttonVariant} 
                                      className={buttonClass}
                                      disabled={hasAnswered}
                                      onClick={() => {
                                        setQuizAnswers(prev => ({
                                          ...prev,
                                          [currentQuizIndex]: {
                                            selected: option,
                                            isCorrect: option === q.answer
                                          }
                                        }));
                                      }}
                                    >
                                      {option}
                                    </Button>
                                  )
                                })}
                              </div>
                              
                              {hasAnswered && (
                                <div className="mt-8 p-5 bg-muted/30 rounded-xl border border-muted-foreground/10 space-y-4">
                                  <div className="flex items-center gap-2">
                                     <span className={`material-symbols-outlined ${quizAnswers[currentQuizIndex].isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {quizAnswers[currentQuizIndex].isCorrect ? 'check_circle' : 'cancel'}
                                     </span>
                                     <span className="font-bold">
                                        {quizAnswers[currentQuizIndex].isCorrect ? 'Correct!' : 'Incorrect'}
                                     </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-normal">{q.explanation}</p>
                                  
                                  <Button 
                                    className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold"
                                    onClick={() => {
                                      if (currentQuizIndex < studySet.quiz.length - 1) {
                                        setCurrentQuizIndex(prev => prev + 1);
                                      } else {
                                        setShowQuizResult(true);
                                      }
                                    }}
                                  >
                                    {currentQuizIndex < studySet.quiz.length - 1 ? 'Next Question' : 'View Results'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                       })()}
                    </div>
                  )}
                </div>
              </ScrollArea>
              </>
            )}
          </div>
        )
      }
    ];
  }, [studySet, generating, currentQuizIndex, quizAnswers, showQuizResult, learningNotes, checkedSections, currentNotePage, noteChapters, currentFlashcardPage, currentQuizResultPage]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studySet) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Study set not found.</p>
        <Button asChild variant="outline" className="rounded-xl shrink-0">
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-hidden min-h-0">
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 h-5 border-none text-white bg-primary bg-opacity-80 shrink-0">
                {studySet.category || "General"}
              </Badge>
              <span className="text-muted-foreground text-xs shrink-0">·</span>
              <span className="text-muted-foreground text-xs shrink-0">
                Updated {new Date(studySet.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{studySet.title}</h1>
            <p className="text-sm text-muted-foreground max-w-2xl line-clamp-1">{studySet.description}</p>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          
          {/* Left Panel: Content / Materials (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
            <LiquidGlassCard glassSize="none" className="flex-1 bg-transparent border-muted/50 rounded-2xl overflow-hidden flex flex-col p-4">
              <SmoothTab items={workspaceTabs} defaultTabId="notes" className="w-full h-full" />
            </LiquidGlassCard>
          </div>

          {/* Right Panel: Progress / Activity (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 custom-scrollbar">
            <LiquidGlassCard glassSize="sm" className="bg-transparent border-muted/50 rounded-2xl flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Study Overview</h3>
                <div className="space-y-6">
                  {/* Overall Mastery Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                     <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 blur-3xl rounded-full" />
                     
                     <span className="text-xs font-bold text-primary uppercase tracking-widest z-10">Overall Mastery</span>
                     <div className="flex items-baseline gap-1 z-10">
                        <span className="text-5xl font-black text-foreground tracking-tighter">{overallMastery}</span>
                        <span className="text-xl font-bold text-muted-foreground">%</span>
                     </div>
                     <Progress 
                        value={overallMastery} 
                        className="h-2 w-full mt-4 bg-primary/20 z-10" 
                        indicatorClassName={
                          overallMastery <= 20 
                            ? "bg-red-500" 
                            : overallMastery < 80 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                        } 
                     />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-muted-foreground/10 flex flex-col gap-2 hover:bg-muted/40 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[14px] text-blue-500">description</span>
                         Notes Read
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{checkedSections.length}</span>
                        <span className="text-xs font-bold text-muted-foreground">/ {totalNotesSections || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-muted-foreground/10 flex flex-col gap-2 hover:bg-muted/40 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[14px] text-purple-500">style</span>
                         Cards Flipped
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{flashcardsFlipped.length}</span>
                        <span className="text-xs font-bold text-muted-foreground">/ {studySet?.flashcards?.length || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-muted-foreground/10 flex flex-col gap-2 hover:bg-muted/40 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[14px] text-amber-500">quiz</span>
                         Quiz Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{Object.values(quizAnswers).filter(a => a.isCorrect).length}</span>
                        <span className="text-xs font-bold text-muted-foreground">/ {studySet?.quiz?.length || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-muted-foreground/10 flex flex-col gap-2 hover:bg-muted/40 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[14px] text-emerald-500">account_tree</span>
                         Mind Map
                      </span>
                      <div className="flex items-center h-full">
                        <span className={cn("text-sm font-bold", mindmapsViewed ? "text-emerald-500" : "text-muted-foreground")}>
                           {mindmapsViewed ? "Viewed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-muted-foreground/10" />

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                   <Button 
                      variant="outline" 
                      className="w-full justify-start h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 hover:text-red-500 transition-colors"
                      onClick={() => {
                        if (confirm("Are you sure you want to reset all progress for this study set?")) {
                          setCurrentQuizIndex(0);
                          setQuizAnswers({});
                          setShowQuizResult(false);
                          setCheckedSections([]);
                          setMindmapsViewed(false);
                          setFlashcardsFlipped([]);
                          localStorage.removeItem(`masteryState-${setId}`);
                        }
                      }}
                   >
                     <span className="material-symbols-outlined mr-2 text-[18px]">restart_alt</span>
                     Reset Progress
                   </Button>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

        </div>
      </div>
      <InsufficientCreditsModal
        isOpen={creditsModal.isOpen}
        onClose={() => setCreditsModal(prev => ({ ...prev, isOpen: false }))}
        requiredCredits={creditsModal.required}
        actionName={creditsModal.action}
      />
    </main>
  );
}
