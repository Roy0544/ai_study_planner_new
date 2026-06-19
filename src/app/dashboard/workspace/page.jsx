// Server Component — owns the route segment config
// The actual UI is a client component in workspace-client.jsx

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { WorkspaceContent } from "./workspace-client";

export const dynamic = 'force-dynamic';

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
