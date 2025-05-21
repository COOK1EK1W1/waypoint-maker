import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function ListItem({ children, onClick, className, selected, actions }: { children: ReactNode | ReactNode[], onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, className?: string, selected?: boolean, actions?: ReactNode[] }) {
  return (
    <div className="px-2 py-1">
      <Button variant={selected ? "active" : "default"} className={cn("w-full p-2 m-0 h-auto flex", className)
      } onClick={onClick} >
        <div className="flex-grow">
          {children}
        </div>
        <div>
          {actions?.map((x, i) => <span className="px-1" key={i}>{x}</span>)}
        </div>
      </Button >
    </div>
  )

}
