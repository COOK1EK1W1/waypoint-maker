import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// tailwind merge helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
