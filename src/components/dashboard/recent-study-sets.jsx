// "use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { fetchStudySets } from "@/actions/study-set";
import { getCategoryIcon } from "@/lib/utils";
import { StudySetMastery } from "@/components/dashboard/study-set-mastery";

export async function RecentStudySets() {
  const result = await fetchStudySets();
  const recentSets = result.success ? result.data.slice(0, 3) : [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text-primary">Recent Study Sets</h3>
        <Button asChild variant="link" className="text-app-brand p-0 h-auto">
          <Link href="/dashboard/sets">View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentSets.map((set, i) => (
          <Link href={`/dashboard/workspace?id=${set.id}`} key={i} className="block h-full">
            <div className="group p-5 border border-app-border bg-app-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md rounded-xl h-full flex flex-col justify-between">
              <CardHeader className="p-0 pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-app-brand/10 flex items-center justify-center text-app-brand overflow-hidden shrink-0">
                    <span className="material-symbols-outlined">{getCategoryIcon(set.category)}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 h-5 border-none text-app-brand bg-app-brand/10 bg-opacity-80 uppercase">
                    {set.category || "General"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <CardTitle className="text-lg text-text-primary group-hover:text-app-brand transition-colors line-clamp-1">{set.title}</CardTitle>
                <p className="mt-2 text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {set.description}
                </p>
                <CardDescription className="mt-3 text-[10px] flex items-center gap-1.5 opacity-60 text-text-muted">
                  {new Date(set.created_at).toLocaleDateString()}
                </CardDescription>
                
                <div className="mt-auto pt-6">
                  <StudySetMastery studySet={set} />
                </div>

                <div className="mt-4 flex items-center gap-1 text-app-brand text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Study Suite <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </CardContent>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
