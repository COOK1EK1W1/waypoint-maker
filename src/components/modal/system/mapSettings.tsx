"use client"

import { useRef } from "react"
import { useMap } from "@/util/context/MapContext"
import Button from "@/components/toolBar/button"
import { latlngToTile, tilesForRadiusKm } from "@/lib/map/tiles"
import { get, set, createStore, clear } from 'idb-keyval'

const tileStore = createStore('mapStore', 'tileStore')

export default function MapSettings() {
  const { tileProvider, setTileProvider } = useMap()

  const urlRef = useRef<HTMLInputElement>(null)

  const applyChanges = () => {
    const url = urlRef.current?.value ?? ""

    if (!url || url.trim() === "") return

    setTileProvider({ url, subdomains: ["a", "b", "c"] })
  }

  const downloadTiles = () => {
    const zoomLevels = [13, 14, 15]
    const radiusKm = 5;
    /*
    const lat = prompt("Enter Latitude")
    const lng = prompt("Enter Longitude")
    */
    const lat = "55.910734"
    const lng = "-3.319931"
    if (lat === null || lng === null) return
    const Lat = Number(lat)
    const Lng = Number(lng)
    if (isNaN(Lat) || isNaN(Lng)) return
    let counter = 0;
    for (const zoomLevel of zoomLevels) {
      const a = latlngToTile({ lat: Lat, lng: Lng }, zoomLevel)
      console.log(zoomLevel)
      const numTiles = tilesForRadiusKm(Lat, zoomLevel, radiusKm)
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
          placeholder="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </div>
      <Button className="w-28" onClick={applyChanges}>Apply</Button>
      <Button className="w-28" onClick={downloadTiles}>Download</Button>
      <Button className="w-28" onClick={clearCache}>Clear Cache</Button>
    </div>
  )
}

