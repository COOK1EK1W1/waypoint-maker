import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

export default function ListItem({ icon, name, onClick, className, selected, menuItems }: {
  icon: ReactNode,
  name: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
  className?: string,
  selected?: boolean,
  menuItems?: ReactNode
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="px-2 py-1">
      <Button variant={selected ? "active" : "default"} className={cn("w-full m-0 p-0 h-auto flex", className)
      }  >
        <div className="flex-grow text-start flex items-center py-2 px-3" onClick={onClick}>
          <span className="inline m-1">{icon}</span><span className="inline-block">{name}</span>
        </div>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>

          <DropdownMenuTrigger asChild>
            <div className="p-1 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setDropdownOpen(true)}>
              <EllipsisVertical className="h-5 w-5 text-slate-500" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48" onClick={() => setDropdownOpen(false)}>
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </Button >
    </div>
  )

}
