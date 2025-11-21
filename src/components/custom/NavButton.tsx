
"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CurrentPage } from '@/lib/types';

interface NavButtonProps {
  page: CurrentPage;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  currentPage: CurrentPage;
  setCurrentPage: (page: CurrentPage | string, newRound?: boolean) => void;
  layout?: 'default' | 'bottom';
}

export const NavButton: React.FC<NavButtonProps> = ({ page, label, icon, disabled = false, currentPage, setCurrentPage, layout = 'default' }) => {
  const isActive = currentPage === page;
  const isBottomLayout = layout === 'bottom';
  const showLabel = page !== 'dashboard';

  const handleClick = () => {
    if (disabled) return;
    if (page === 'inputRoundChoice') {
      setCurrentPage('inputRoundChoice', true);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <Button
      variant="ghost" 
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center transition-all duration-150 ease-in-out h-full", // Common structural
        
        isBottomLayout
          ? cn( 
              "flex-col flex-1 rounded-none", // Bottom layout structure
              isActive
                ? "bg-accent text-accent-foreground" 
                : "bg-black text-accent hover:bg-[#363636] hover:text-accent"
            )
          : cn( // Styles for default layout
              "flex-row flex-1 sm:flex-initial sm:w-auto text-sm sm:text-base font-medium py-2 px-3 sm:px-4 rounded-lg shadow [&_svg]:size-4",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground opacity-90 hover:opacity-100"
            ),
        
        disabled ? "cursor-not-allowed !opacity-50 !bg-muted !text-muted-foreground" : "" // Disabled state
      )}
      title={disabled ? "Log a round to access this feature" : label}
    >
      <div className="flex flex-col items-center justify-center h-full pt-1">
        <div className="[&_svg]:size-6">
            {icon}
        </div>
        {showLabel && (
          <span className={cn(
            "text-xs font-body-sans mt-1",
            isActive ? "text-accent-foreground" : "text-accent"
          )}>
            {label}
          </span>
        )}
      </div>
    </Button>
  );
};
