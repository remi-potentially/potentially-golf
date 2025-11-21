
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
import Link from 'next/link'; // Keep Link for potential future use if needed, or mailto

interface AboutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AboutDialog({ isOpen, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground font-headline text-center">About Potentially</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3 text-sm text-foreground">
          <p className="text-center font-semibold">
            Potentially v1.0.0 (Alpha)
          </p>
          <p className="text-center italic mt-2 px-4">
            Your personal AI golf coach. Potentially turns your round data into smart, structured practice so you can lower your handicap and enjoy the game more.
          </p>
          <p className="text-center mt-4">
            This app is designed and developed by Potentially Golf.
          </p>
          <div className="text-center mt-4 space-y-1">
            <p className="font-medium">Contact & Support:</p>
            <p>For any questions, support queries, or feedback, please email us at:</p>
            <a href="mailto:potentiallygolf@gmail.com" className="font-pacifico text-black hover:underline">
              potentiallygolf@gmail.com
            </a>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center items-center pt-4 border-t border-border mt-2 text-xs text-muted-foreground">
          <div className="text-center mb-2 sm:mb-0 sm:mr-4">
             © 2025 Potentially Golf. Potential everywhere.
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <span>Privacy Policy (to follow)</span>
            <span className="hidden sm:inline">•</span>
            <span>Terms of Service (to follow)</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
