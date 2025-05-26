"use client"
import { mapElements, useMap } from "@/util/context/MapContext"
import { Eye, Minus, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../ui/dropdown-menu"
import { capitalise } from "@/lib/utils"

export default function MapControlls() {
  const { mapRef, viewable, setViewable } = useMap()

  const toggle = (name: (typeof mapElements)[number]) => {
    setViewable((cur) => {
      let temp = { ...cur }
      temp[name] = !temp[name]
      return temp
    })
  }

  return (
    <div className="w-fit rounded-lg shadow-lg bg-white flex p-1">
      <span className="cursor-pointer hover:bg-slate-200 rounded-lg p-1" onClick={() => mapRef.current?.zoomIn()}>
        <Plus className="h-5 w-5" />
      </span>
      <span className="cursor-pointer hover:bg-slate-200 rounded-lg p-1" onClick={() => mapRef.current?.zoomOut()}>
        <Minus className="h-5 w-5" />
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer hover:bg-slate-200 rounded-lg p-1">
          <Eye className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {mapElements.map((element, i) => (
            <DropdownMenuCheckboxItem
              key={i}
              checked={viewable[element]}
              onCheckedChange={() => toggle(element)}
            >
              {capitalise(element)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div >
  )
}
