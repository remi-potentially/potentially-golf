
import * as React from "react"
import { Card as ShadCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CustomCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <ShadCard className={cn("shadow-lg rounded-xl p-4 sm:p-6 bg-card border-none", className)} {...props}>
    {children}
  </ShadCard>
);
