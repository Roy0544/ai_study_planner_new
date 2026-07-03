// Server Component — owns the route segment config
// The actual UI is a client component in workspace-client.jsx

import { Suspense } from "react";
import { WorkspaceContent } from "./workspace-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "AI Study Workspace",
  description: "Your interactive AI learning space. Review materials, generate flashcards, solve quizzes, and inspect mindmaps.",
};

function WorkspaceSkeleton() {
  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-4rem)] bg-app-bg text-text-primary animate-pulse">
      {/* Top Header Mock */}
      <div className="h-14 border-b border-app-border px-6 flex items-center justify-between bg-app-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-app-inset/60" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-app-inset/60 rounded" />
            <div className="h-3 w-48 bg-app-inset/60 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-app-inset/60 rounded-lg" />
          <div className="h-8 w-8 rounded-full bg-app-inset/60" />
        </div>
      </div>
      
      {/* Content Columns Mock */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Mock */}
        <div className="w-80 border-r border-app-border bg-app-card p-6 space-y-6 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="h-4 w-20 bg-app-inset/60 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full bg-app-inset/60 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-app-inset/40 space-y-3">
            <div className="h-3 w-16 bg-app-inset/60 rounded" />
            <div className="h-2 w-full bg-app-inset/60 rounded" />
            <div className="h-8 w-full bg-app-inset/60 rounded-lg" />
          </div>
        </div>

        {/* Main Panel Mock */}
        <div className="flex-1 bg-app-bg p-8 space-y-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-6 w-1/3 bg-app-inset/60 rounded" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-app-inset/60 rounded" />
              <div className="h-4 w-full bg-app-inset/60 rounded" />
              <div className="h-4 w-5/6 bg-app-inset/60 rounded" />
              <div className="h-4 w-full bg-app-inset/60 rounded" />
              <div className="h-4 w-2/3 bg-app-inset/60 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceContent />
    </Suspense>
  );
}
