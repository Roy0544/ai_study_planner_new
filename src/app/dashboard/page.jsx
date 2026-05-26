"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="inset">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">StudyAI</span>
                <span className="text-[10px] text-muted-foreground mt-1">v1.0.4</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Home">
                  <Link href="/dashboard">
                    <span className="material-symbols-outlined">home</span>
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="History">
                  <Link href="/dashboard/history">
                    <span className="material-symbols-outlined">history</span>
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/dashboard/settings">
                    <span className="material-symbols-outlined">settings</span>
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start gap-2 h-10 border-primary/20 hover:bg-primary/5 text-primary">
              <span className="material-symbols-outlined text-lg">star</span>
              Upgrade to Pro
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-muted-foreground">Workspace / Dashboard</h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AX</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Alex Johnson</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="p-6 space-y-8 max-w-6xl mx-auto w-full">
            <section className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h1>
              <p className="text-muted-foreground">Ready to crush your study goals today?</p>
            </section>

            <section>
              <Card className="border-muted/50 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle>Create New Study Set</CardTitle>
                  <CardDescription>Upload your materials to generate interactive study tools.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                      <TabsTrigger value="upload">File Upload</TabsTrigger>
                      <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="space-y-4">
                      <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-all cursor-pointer group border-muted-foreground/20">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                          <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Drag & Drop files here</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                          Supports PDF, DOCX, TXT, and images. Max 50MB per file.
                        </p>
                        <Button variant="outline" className="h-10 px-6">
                          Browse Local Files
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="paste">
                      <div className="space-y-4">
                        <textarea 
                          className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Paste your notes or text here..."
                        />
                        <div className="flex justify-end">
                           <Button>Synthesize Text</Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-8 flex justify-end">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 h-12 px-8">
                      <span className="material-symbols-outlined">auto_awesome</span>
                      Generate Study Suite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Recent Study Sets</h3>
                <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Photosynthesis Notes", subject: "Biology 101", time: "2 hours ago", type: "pdf", icon: "picture_as_pdf" },
                  { title: "Organic Chemistry", subject: "Chapter 1-3", time: "Yesterday", type: "doc", icon: "description" },
                  { title: "WWII Timeline", subject: "History Seminar", time: "3 days ago", type: "img", icon: "image" }
                ].map((set, i) => (
                  <Card key={i} className="group hover:border-primary/50 transition-all cursor-pointer hover:shadow-md border-muted/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">{set.icon}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{set.time}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{set.title}</CardTitle>
                      <CardDescription className="mt-1">{set.subject}</CardDescription>
                      <div className="mt-4 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Study Suite <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
