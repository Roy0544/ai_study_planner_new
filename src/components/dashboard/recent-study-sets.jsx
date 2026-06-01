// "use client";

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
import { fetchStudySets } from "@/actions/study-set";
import { getCategoryIcon } from "@/lib/utils";

export async function RecentStudySets() {
  const result = await fetchStudySets();
  const recentSets = result.success ? result.data : [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Recent Study Sets</h3>
        <Button asChild variant="link" className="text-primary p-0 h-auto">
          <Link href="/dashboard/sets">View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentSets.map((set, i) => (
          <Link href={`/dashboard/workspace?id=${set.id}`} key={i}>
            <LiquidGlassCard 
              glassSize="sm" 
              className="group border-muted/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-2xl rounded-2xl bg-transparent h-full"
              containerClassName="flex flex-col h-full"
            >
              <CardHeader className="p-0 pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0">
                    <span className="material-symbols-outlined">{getCategoryIcon(set.category)}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 h-5 border-none text-primary bg-primary/10 bg-opacity-80 uppercase">
                    {set.category || "General"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{set.title}</CardTitle>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {set.description}
                </p>
                <CardDescription className="mt-3 text-[10px] flex items-center gap-1.5 opacity-60">
                  {new Date(set.created_at).toLocaleDateString()}
                </CardDescription>
                
                <div className="mt-auto pt-6 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="text-foreground">0%</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
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
