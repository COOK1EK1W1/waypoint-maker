"use client"

import { useRef } from "react"
import { useMap } from "@/util/context/MapContext"
import Button from "@/components/toolBar/button"
import { latlngToTile, tilesForRadiusKm } from "@/lib/map/tiles"
import { get, set, createStore, clear } from 'idb-keyval'
import { useWaypoints } from "@/util/context/WaypointContext"
import { filterLatLngCmds } from "@/lib/commands/commands"
import { avgLatLng, getLatLng } from "@/lib/world/latlng"

const tileStore = createStore('mapStore', 'tileStore')

export default function MapSettings() {
  const { tileProvider, setTileProvider } = useMap()
  const { waypoints } = useWaypoints()

  const urlRef = useRef<HTMLInputElement>(null)
  const subDomainRef = useRef<HTMLInputElement>(null)

  const applyChanges = () => {
    const url = urlRef.current?.value ?? ""
    const subdomainsInput = subDomainRef.current?.value ?? ""

    if (!url || url.trim() === "") return

    const subdomains = subdomainsInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0)

    setTileProvider({ url, subdomains })
  }


  const downloadTiles = () => {
    const zoomLevels = [9, 10, 11, 12, 13, 14, 15, 16, 17]
    const radiusKm = 5;
    let avg = avgLatLng(filterLatLngCmds(waypoints.flatten("Main")).map(getLatLng))
    if (avg === undefined) {
      const lat = prompt("Enter Latitude")
      const lng = prompt("Enter Longitude")
      if (lat === null || lng === null) return
      const Lat = Number(lat)
      const Lng = Number(lng)
      if (isNaN(Lat) || isNaN(Lng)) return
      avg = { lat: Lat, lng: Lng }
    }
    let counter = 0;
    for (const zoomLevel of zoomLevels) {
      const a = latlngToTile(avg, zoomLevel)
      console.log(zoomLevel)
      const numTiles = tilesForRadiusKm(avg.lat, zoomLevel, radiusKm)
      for (let x = -numTiles / 2; x < numTiles / 2; x++) {
        for (let y = -numTiles / 2; y < numTiles / 2; y++) {
          counter++

          const tileURL = tileProvider.url.replace("{x}", "" + (a.x + x))
            .replace("{y}", "" + (a.y + y))
            .replace("{z}", "" + zoomLevel)
            .replace("{s}", tileProvider.subdomains[counter % tileProvider.subdomains.length])
          fetch(tileURL).then((res) => {
            console.log(res)
            res.blob().then((blob) => {
              console.log("setting")
              set(`tile:${a.x + x}:${a.y + y}:${zoomLevel}`, blob, tileStore).then(() => {
                console.log("set")
              })
            })
          })
        }
      }
    }
  }

  const clearCache = () => {
    clear(tileStore)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="">Tile URL</label>
        <input
          ref={urlRef}
          className="w-full"
          defaultValue={tileProvider.url}
          placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </div>
      <div>
        <label className="">Sub Domains</label>
        <input
          ref={subDomainRef}
          className="w-full"
          defaultValue={tileProvider.subdomains.join(", ")}
          placeholder="a, b, c"
        />
      </div>
      <Button className="w-28" onClick={applyChanges}>Apply</Button>
      <Button className="w-28" onClick={downloadTiles}>Download</Button>
      <Button className="w-28" onClick={clearCache}>Clear Cache</Button>
    </div>
  )
}

