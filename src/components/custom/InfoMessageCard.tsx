
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface InfoMessageCardProps {
  title: string;
  message: string;
  actionButtonLabel?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  isDismissible?: boolean;
  onDismiss?: () => void;
}

export const InfoMessageCard: React.FC<InfoMessageCardProps> = ({ 
  title, 
  message, 
  actionButtonLabel, 
  onActionClick, 
  icon, 
  isDismissible = false, 
  onDismiss 
}) => {
  return (
    <Card className="relative text-center border-border bg-card shadow-lg rounded-xl">
      {isDismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Dismiss"
        >
          <X size={18} />
        </Button>
      )}
      <CardHeader>
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        <CardTitle className="text-xl font-headline text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-foreground/80 mb-6">{message}</CardDescription>
        {actionButtonLabel && onActionClick && (
          <Button
            onClick={onActionClick}
            variant="default"
            className="py-2 px-6 rounded-lg font-semibold shadow-md transition-opacity mx-auto hover:bg-black hover:text-primary"
          >
            {actionButtonLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
