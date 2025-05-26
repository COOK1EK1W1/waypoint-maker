import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// tailwind merge helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalise(str: string) {
  return str && str[0].toUpperCase() + str.slice(1);
}
