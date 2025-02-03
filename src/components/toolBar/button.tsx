"use client"
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Button({ children, onClick, className, type }: { children: ReactNode, onClick?: () => void, className?: string, type?: "button" | "submit" | undefined }) {
  return (
    <div className="flex items-center">
      <button type={type} onMouseDown={onClick} className={cn("p-1 m-1 border-1 rounded-lg bg-slate-100 border-slate-200 flex items-center justify-center border-2 duration-200", className)}>
        {children}
      </button>
    </div>
  )
}
