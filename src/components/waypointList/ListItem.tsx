import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function ListItem({ icon, name, onClick, className, selected, actions }: {
  icon: ReactNode,
  name: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  className?: string,
  selected?: boolean,
  actions?: ReactNode[]
}) {
  return (
    <div className="px-2 py-1">
      <Button variant={selected ? "active" : "default"} className={cn("w-full p-2 m-0 h-auto flex", className)
      } onClick={onClick} >
        <div className="flex-grow text-start">
          <span className="inline-block mr-1">{icon}</span><span className="inline-block">{name}</span>
        </div>
        <div>
          {actions?.map((x, i) => <span className="px-1" key={i}>{x}</span>)}
        </div>
      </Button >
    </div>
  )

}
