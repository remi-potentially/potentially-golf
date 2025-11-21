import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseScoreToPar = (scoreToParStr: string | null | undefined): number | null => {
  if (!scoreToParStr) return null;
  if (scoreToParStr.toUpperCase() === 'E') return 0;
  const num = parseInt(scoreToParStr.replace('+', ''));
  return isNaN(num) ? null : num;
};
