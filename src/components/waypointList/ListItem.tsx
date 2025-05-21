import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

export default function ListItem({ icon, name, onClick, className, selected, menuItems }: {
  icon: ReactNode,
  name: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  className?: string,
  selected?: boolean,
  menuItems?: ReactNode
}) {
  return (
    <div className="px-2 py-1">
      <Button variant={selected ? "active" : "default"} className={cn("w-full p-2 m-0 h-auto flex", className)
      } onClick={onClick} >
        <div className="flex-grow text-start flex items-center">
          <span className="inline-block mr-1">{icon}</span><span className="inline-block">{name}</span>
        </div>
        <DropdownMenu>

          <DropdownMenuTrigger asChild>
            <div className="p-1 hover:bg-slate-100 rounded-full transition-colors" >
              <EllipsisVertical className="h-5 w-5 text-slate-500" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </Button >
    </div>
  )

}
