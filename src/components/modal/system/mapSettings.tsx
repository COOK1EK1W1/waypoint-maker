"use client"

import { useRef, useState, useEffect } from "react"
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
  const [size, setSize] = useState({ size: 0 })
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [totalTiles, setTotalTiles] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const urlRef = useRef<HTMLInputElement>(null)
  const subDomainRef = useRef<HTMLInputElement>(null)

  // verify and save the tile provider url and subdomains
  const applyTileProviderChanges = () => {

    const url = urlRef.current?.value ?? ""
    if (!url || url.trim() === "") return

    const subdomainsInput = subDomainRef.current?.value ?? ""

    // split the subdomains into strings
    const subdomains = subdomainsInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0)

    setTileProvider({ url, subdomains })
  }

  const handleReset = () => {
    setTileProvider({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: ["a", "b", "c"] })
    // Force re-render by updating size
    navigator.storage.estimate().then((a) => {
      setSize({ size: a.usage || 0 })
    })
  }

  const downloadTiles = async () => {
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

    const downloadQueue: (() => Promise<void>)[] = []
    let completedTiles = 0

    for (const zoomLevel of zoomLevels) {
      const a = latlngToTile(avg, zoomLevel)
      const numTiles = tilesForRadiusKm(avg.lat, zoomLevel, radiusKm)
      for (let x = Math.floor(-numTiles / 2); x < Math.ceil(numTiles / 2); x++) {
        for (let y = Math.floor(-numTiles / 2); y < Math.ceil(numTiles / 2); y++) {
          const tileURL = tileProvider.url.replace("{x}", "" + (a.x + x))
            .replace("{y}", "" + (a.y + y))
            .replace("{z}", "" + zoomLevel)
            .replace("{s}", tileProvider.subdomains[downloadQueue.length % tileProvider.subdomains.length])

          downloadQueue.push(async () => {
            try {
              const res = await fetch(tileURL)
              const blob = await res.blob()
              await set(`tile:${a.x + x}:${a.y + y}:${zoomLevel}`, blob, tileStore)
              completedTiles++
              setDownloadProgress(completedTiles)
            } catch (error) {
              console.error(`Failed to download tile: ${tileURL}`, error)
            }
          })
        }
      }
    }

    setTotalTiles(downloadQueue.length)
    setDownloadProgress(0)
    setIsDownloading(true)

    // Process queue with rate limiting
    const RATE_LIMIT = 10 // tiles per second
    const DELAY = 1000 / RATE_LIMIT

    for (const download of downloadQueue) {
      await download()
      //await new Promise(resolve => setTimeout(resolve, DELAY))
    }

    setIsDownloading(false)
  }

  const clearCache = async () => {
    await clear(tileStore)
    // Force re-render by updating size
    navigator.storage.estimate().then((a) => {
      setSize({ size: a.usage || 0 })
    })
  }

  // Update size on mount and when needed
  useEffect(() => {
    navigator.storage.estimate().then((a) => {
      setSize({ size: a.usage || 0 })
    })
  }, [tileProvider, downloadProgress]) // Re-run when tile provider changes

  return (
    <div className="space-y-4">
      <h2>Map Tile Provider</h2>
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

      <div className="flex flex-row w-full justify-center">
        <Button className="w-28" onClick={applyTileProviderChanges}>Apply</Button>
        <Button className="w-28" onClick={handleReset}>Reset</Button>
      </div>


      <h2>Offline Support</h2>
      <p>Download map and terrain data</p>
      <label>
        <Button className="w-28" onClick={downloadTiles} disabled={isDownloading}>
          {isDownloading ? "Downloading" : "Download"}
        </Button>
      </label>
      <label>
        Cache Size: {(Math.floor(size.size / 100000) / 10)}mb
        <Button className="w-28" onClick={clearCache}>Clear Cache</Button>
      </label>
      {isDownloading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(downloadProgress / totalTiles) * 100}%` }}
          ></div>
          <div className="text-sm text-gray-600 mt-1">
            {downloadProgress} / {totalTiles} tiles downloaded
          </div>
        </div>
      )}
    </div>
  )
}

