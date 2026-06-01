"use client";

import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteStudySet } from "@/actions/study-set";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCategoryIcon } from "@/lib/utils";

export function StudySetCard({ set }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this study set?")) return;

    setIsDeleting(true);
    const result = await deleteStudySet(set.id);
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to delete study set: " + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Link href={`/dashboard/workspace?id=${set.id}`}>
      <LiquidGlassCard 
        glassSize="sm" 
        className={`group border-muted/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-2xl rounded-2xl bg-transparent h-full ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        containerClassName="flex flex-col h-full min-h-[220px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0">
            <span className="material-symbols-outlined">
              {getCategoryIcon(set.category)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 h-5 bg-primary/10 text-primary border-none">
              {set.category || "General"}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
              onClick={handleDelete}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{set.title}</h3>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {set.description}
          </p>
          
          <div className="mt-6 flex items-center justify-between border-t border-muted-foreground/10 pt-4 text-[10px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
              {new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
              Study Now
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </Link>
  );
}
