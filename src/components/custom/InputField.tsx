"use client";
import type React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  step?: string | number;
  optional?: boolean;
  notApplicableName?: string;
  notApplicableValue?: boolean;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "search" | "email" | "url";
  readOnly?: boolean;
  className?: string;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  step = "any",
  optional = false,
  notApplicableName,
  notApplicableValue,
  onCheckboxChange,
  inputMode = "text",
  readOnly = false,
  className,
  tooltip
}) => {
  const inputId = name;
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center mb-1">
        <Label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </Label>
        {tooltip && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 cursor-help">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{label}</AlertDialogTitle>
                <AlertDialogDescription>
                  {tooltip}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {optional && <span className="text-xs text-foreground/70 ml-2"> (Optional)</span>}
      </div>
      <div className="flex items-center">
        <Input
          type={type}
          name={name}
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={type === "number" ? step : undefined}
          inputMode={inputMode}
          disabled={optional && notApplicableValue}
          readOnly={readOnly}
          className="mt-1 block w-full px-3 py-2 border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
        />
        {optional && notApplicableName && onCheckboxChange && (
          <div className="ml-4 flex items-center whitespace-nowrap">
            <Checkbox
              id={notApplicableName}
              name={notApplicableName}
              checked={notApplicableValue}
              onCheckedChange={(checked) => onCheckboxChange({ target: { name: notApplicableName, checked: !!checked, type: 'checkbox', value: String(checked) } } as any)}
              className="h-4 w-4 rounded border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label htmlFor={notApplicableName} className="ml-2 text-xs text-foreground/80">N/A</Label>
          </div>
        )}
      </div>
    </div>
  );
};

export const TextAreaField: React.FC<Omit<InputFieldProps, 'type' | 'step' | 'inputMode' | 'optional' | 'notApplicableName' | 'notApplicableValue' | 'onCheckboxChange'> & { rows?: number }> = ({ label, name, value, onChange, placeholder, readOnly, rows = 3, className }) => {
  const textAreaId = name;
  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={textAreaId} className="block text-sm font-medium mb-1 text-foreground">
        {label}
      </Label>
      <textarea
        id={textAreaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm bg-background text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}
