"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/ui/light-rays";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function WorkspacePage() {
  const currentSet = {
    title: "Photosynthesis Notes",
    subject: "Biology 101",
    totalCards: 45,
    completedCards: 32,
    progress: 71,
    color: "bg-green-500",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative bg-background">
        <LightRays className="opacity-50" color="#8B5CF6" count={5} speed={15} />
        <div className="relative z-10 flex flex-col w-full h-screen overflow-hidden">
          <DashboardHeader />
          
          <main className="flex-1 p-6 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
              {/* Workspace Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 border-none text-white ${currentSet.color} bg-opacity-80`}>
                      {currentSet.subject}
                    </Badge>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">Updated 2 hours ago</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">{currentSet.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-xl border-muted-foreground/20">
                    <span className="material-symbols-outlined mr-2 text-sm">share</span>
                    Share
                  </Button>
                  <Button className="rounded-xl bg-secondary text-secondary-foreground hover:bg-white hover:text-secondary transition-all shadow-lg shadow-secondary/20 font-bold">
                    <span className="material-symbols-outlined mr-2 text-sm">auto_awesome</span>
                    AI Chat
                  </Button>
                </div>
              </div>

              {/* Main Workspace Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
                
                {/* Left Panel: Content / Materials (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
                  <LiquidGlassCard glassSize="none" className="flex-1 bg-transparent border-muted/50 rounded-2xl overflow-hidden flex flex-col">
                    <Tabs defaultValue="study" className="flex flex-col h-full">
                      <div className="px-6 pt-4 border-b border-muted-foreground/10">
                        <TabsList className="bg-transparent gap-6 h-12 p-0">
                          <TabsTrigger value="study" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-0 text-sm font-semibold h-full transition-none">Study Mode</TabsTrigger>
                          <TabsTrigger value="source" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-0 text-sm font-semibold h-full transition-none">Source Material</TabsTrigger>
                          <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-0 text-sm font-semibold h-full transition-none">My Notes</TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <div className="flex-1 min-h-0">
                        <TabsContent value="study" className="h-full m-0 p-6">
                          <div className="flex flex-col h-full items-center justify-center gap-8">
                            <div className="w-full max-w-lg aspect-[4/3] bg-muted/20 border border-muted-foreground/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center relative group cursor-pointer hover:border-secondary/50 transition-all">
                              <NoiseTexture className="opacity-[0.03]" />
                              <span className="text-xl font-medium leading-relaxed">How does the process of photolysis contribute to the light-dependent reactions of photosynthesis?</span>
                              <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-muted-foreground">Click to reveal answer</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-muted-foreground/20 hover:text-secondary hover:border-secondary">
                                <span className="material-symbols-outlined">arrow_back</span>
                              </Button>
                              <div className="px-6 py-2 rounded-full bg-muted/30 border border-muted-foreground/10 text-sm font-bold">
                                12 / 45
                              </div>
                              <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-muted-foreground/20 hover:text-secondary hover:border-secondary">
                                <span className="material-symbols-outlined">arrow_forward</span>
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="source" className="h-full m-0">
                          <ScrollArea className="h-full p-6">
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                              <h2 className="text-foreground font-bold text-lg">Light-Dependent Reactions</h2>
                              <p>The light-dependent reactions take place on the thylakoid membranes. The inside of the thylakoid membrane is called the lumen, and outside the thylakoid membrane is the stroma, where the light-independent reactions take place.</p>
                              <p>The thylakoid membrane contains some integral membrane proteins that complexes that catalyze the light reactions. There are four major protein complexes in the thylakoid membrane: Photosystem II (PSII), Cytochrome b6f complex, Photosystem I (PSI), and ATP synthase. These four complexes work together to ultimately produce ATP and NADPH.</p>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="notes" className="h-full m-0 p-6">
                          <div className="text-center text-muted-foreground py-12">
                            No notes added for this study set yet.
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </LiquidGlassCard>
                </div>

                {/* Right Panel: Progress / Activity (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                  <LiquidGlassCard glassSize="sm" className="bg-transparent border-muted/50 rounded-2xl flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Current Progress</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>Mastery</span>
                          <span>{currentSet.progress}%</span>
                        </div>
                        <Progress value={currentSet.progress} className="h-2" indicatorClassName={currentSet.color} />
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-muted/20 border border-muted-foreground/10 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Studied</div>
                            <div className="text-lg font-bold">{currentSet.completedCards}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/20 border border-muted-foreground/10 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Total</div>
                            <div className="text-lg font-bold">{currentSet.totalCards}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-muted-foreground/10" />

                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Upcoming Schedule</h3>
                      <div className="space-y-3">
                        {[
                          { title: "Review Quiz", time: "Today, 4:00 PM", icon: "quiz" },
                          { title: "Final Exam Prep", time: "Tomorrow, 10:00 AM", icon: "event" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/20 transition-colors group cursor-pointer border border-transparent hover:border-muted-foreground/10">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                              <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{item.title}</span>
                              <span className="text-[10px] text-muted-foreground">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full rounded-xl bg-muted/20 border border-muted-foreground/20 hover:bg-muted/30 text-foreground font-bold h-11">
                      View Full Analytics
                    </Button>
                  </LiquidGlassCard>

                  <LiquidGlassCard glassSize="sm" className="bg-transparent border-muted/50 rounded-2xl flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                      <span className="material-symbols-outlined text-3xl animate-pulse">local_fire_department</span>
                    </div>
                    <h3 className="text-lg font-bold">7-Day Streak!</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">You're on fire! Complete today's session to reach 8 days.</p>
                    <div className="mt-6 w-full flex justify-between px-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-amber-500 text-white' : 'bg-muted/30 text-muted-foreground border border-muted-foreground/10'}`}>
                            {i < 3 ? '✓' : ''}
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">{day}</span>
                        </div>
                      ))}
                    </div>
                  </LiquidGlassCard>
                </div>

              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
