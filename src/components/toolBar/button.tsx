import { cn } from "@/util/tw";
import { ReactNode } from "react";

export default function Button({ children, onClick, className }: { children: ReactNode, onClick?: () => void, className?: string }) {
  return (
    <div className="flex items-center">
      <button onMouseDown={onClick} className={cn("p-1 m-1 border-1 rounded-lg bg-slate-100 border-slate-200 flex items-center justify-center border-2", className)}>
        {children}
      </button>
    </div>
  )
}
