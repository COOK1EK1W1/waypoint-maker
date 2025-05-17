"use client"

import { useRef } from "react"
import { useMap } from "@/util/context/MapContext"
import Button from "@/components/toolBar/button"

export default function MapSettings() {
  const { tileProvider, setTileProvider } = useMap()

  const urlRef = useRef<HTMLInputElement>(null)

  const applyChanges = () => {
    const url = urlRef.current?.value ?? ""

    if (!url || url.trim() === "") return

    setTileProvider({ url, subdomains: ["mt1", "mt2", "mt3"] })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="">Tile URL</label>
        <input
          ref={urlRef}
          className="w-full"
          defaultValue={tileProvider.url}
          placeholder="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </div>
      <Button onClick={applyChanges}>Apply</Button>
    </div>
  )
}

