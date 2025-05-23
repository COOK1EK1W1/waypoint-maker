import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function ListItem({ children, onMouseDown, className, selected, actions }: { children: ReactNode | ReactNode[], onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void, className?: string, selected?: boolean, actions?: ReactNode[] }) {
  return (
    <div tabIndex={0} className={cn("rounded-lg p-2 m-2 border-slate-200 border-2 cursor-pointer flex", className || "", selected ? "bg-slate-200" : "")
    } onMouseDown={onMouseDown} >
      <div className="flex-grow">
        {children}
      </div>
      <div>
        {actions?.map((x, i) => <span className="px-1" key={i}>{x}</span>)}
      </div>
    </div >

  )

}
