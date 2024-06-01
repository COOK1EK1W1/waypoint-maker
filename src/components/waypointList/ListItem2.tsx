import { cn } from "@/util/tw";
import { ReactNode } from "react";

export default function ListItem2({children, onClick, className, selected}: {children: ReactNode| ReactNode[], onClick?: (e: React.MouseEvent<HTMLDivElement>)=>void, className?: string, selected?: boolean}){
  return (
    <div className={cn("rounded p-2 m-2 border-grey border-2 cursor-pointer", className || "", selected ? "bg-slate-200" : "")} onClick={onClick}> 
      {children}
    </div>

  )

}
