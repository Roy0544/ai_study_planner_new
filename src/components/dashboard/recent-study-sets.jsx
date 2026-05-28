"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function RecentStudySets() {
  const recentSets = [
    { 
      title: "Photosynthesis Notes", 
      subject: "Biology 101", 
      time: "2 hours ago", 
      icon: "picture_as_pdf",
      progress: 70,
      cardCount: 45,
      color: "bg-green-500"
    },
    { 
      title: "Organic Chemistry", 
      subject: "Chemistry", 
      time: "Yesterday", 
      icon: "description",
      progress: 35,
      cardCount: 120,
      color: "bg-purple-500"
    },
    { 
      title: "WWII Timeline", 
      subject: "History", 
      time: "3 days ago", 
      icon: "image",
      progress: 100,
      cardCount: 32,
      color: "bg-amber-500"
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Recent Study Sets</h3>
        <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentSets.map((set, i) => (
          <Link href="/dashboard/workspace" key={i}>
            <LiquidGlassCard glassSize="sm" className="group border-muted/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-2xl rounded-2xl bg-transparent flex flex-col h-full">
              <CardHeader className="p-0 pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{set.icon}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 border-none text-white ${set.color} bg-opacity-80`}>
                    {set.subject}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{set.title}</CardTitle>
                <CardDescription className="mt-1 text-xs flex items-center gap-1.5">
                  {set.time} · {set.cardCount} cards
                </CardDescription>
                
                <div className="mt-auto pt-6 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{set.progress}%</span>
                  </div>
                  <Progress value={set.progress} className="h-1.5" indicatorClassName={set.color} />
                </div>

                <div className="mt-4 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Study Suite <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </CardContent>
            </LiquidGlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
