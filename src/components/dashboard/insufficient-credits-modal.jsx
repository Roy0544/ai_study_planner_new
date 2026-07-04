"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function InsufficientCreditsModal({ isOpen, onClose, requiredCredits, currentCredits, actionName }) {
  const router = useRouter();

  const handleRedirect = () => {
    onClose();
    router.push("/dashboard/billing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2.5rem)] sm:max-w-lg bg-surface border border-muted-foreground/15 text-foreground rounded-xl p-6 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-bounce">
            <span className="material-symbols-outlined text-2xl font-bold">toll</span>
          </div>
          <DialogTitle className="text-lg font-extrabold">Insufficient Credits</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-sm">
            You don't have enough credits to perform this action. Top up your balance to continue.
          </DialogDescription>
        </DialogHeader>

        {/* Visual comparison */}
        <div className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/5 space-y-3 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Action:</span>
            <span className="font-bold text-foreground">{actionName || "AI Generation"}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Required credits:</span>
            <span className="font-extrabold text-orange-400">{requiredCredits} credits</span>
          </div>
          {currentCredits !== undefined && (
            <div className="flex justify-between items-center text-muted-foreground pt-1.5 border-t border-muted-foreground/5">
              <span>Your balance:</span>
              <span className="font-bold text-amber-500">{currentCredits} credits</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto font-semibold rounded-lg text-xs border border-app-border hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedirect}
            className="w-full sm:w-auto font-bold rounded-lg text-xs bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
          >
            <span className="material-symbols-outlined text-[14px] mr-1.5">payments</span>
            Buy Credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
