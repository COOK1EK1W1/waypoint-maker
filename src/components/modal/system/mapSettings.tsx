"use client"

import { useRef, useState, useEffect } from "react"
import { useMap } from "@/util/context/MapContext"
import { latlngToTile, tilesForRadiusKm } from "@/lib/map/tiles"
import { createStore, clear } from 'idb-keyval'
import { useWaypoints } from "@/util/context/WaypointContext"
import { filterLatLngCmds } from "@/lib/commands/commands"
import { avgLatLng, getLatLng } from "@/lib/world/latlng"
import { Button } from "@/components/ui/button"

const tileStore = createStore('mapStore', 'tileStore')

const ZOOM_LEVELS = [9, 10, 11, 12, 13, 14, 15, 16, 17]
const RADIUS_KM = 7;

export default function MapSettings() {
  const { tileProvider, setTileProvider, mapRef } = useMap()
  const { waypoints } = useWaypoints()
  const [size, setSize] = useState({ size: 0 })
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [totalTiles, setTotalTiles] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const urlRef = useRef<HTMLInputElement>(null)
  const subDomainRef = useRef<HTMLInputElement>(null)

  // verify and save the tile provider url and subdomains
  const applyTileProviderChanges = () => {

    // check for tile provider URL
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

  // reset the tile provider
  const handleReset = () => {
    setTileProvider({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: ["a", "b", "c"] })
    // Force re-render by updating size
    navigator.storage.estimate().then((a) => {
      setSize({ size: a.usage || 0 })
    })
  }

  const downloadTiles = async () => {

    // find where we should download, try average of waypoitns first
    let avg = avgLatLng(filterLatLngCmds(waypoints.flatten("Main")).map(getLatLng))
    if (avg === undefined) {
      // if not, use center of map
      const currentCenter = mapRef.current?.getCenter()
      if (currentCenter == undefined) return
      avg = currentCenter
    }

    const downloadQueue: (() => Promise<void>)[] = []
    let completedTiles = 0

    // go through each of the zoom levels 
    for (const zoomLevel of ZOOM_LEVELS) {

      // get the center tile for zoom level
      const a = latlngToTile(avg, zoomLevel)
      // get how many tiles we should extend in each direction from center
      const numTiles = tilesForRadiusKm(avg.lat, zoomLevel, RADIUS_KM)

      for (let x = Math.floor(-numTiles / 2); x < Math.ceil(numTiles / 2); x++) {
        for (let y = Math.floor(-numTiles / 2); y < Math.ceil(numTiles / 2); y++) {

          // generate the url
          const tileURL = tileProvider.url.replace("{x}", "" + (a.x + x))
            .replace("{y}", "" + (a.y + y))
            .replace("{z}", "" + zoomLevel)
            .replace("{s}", tileProvider.subdomains[downloadQueue.length % tileProvider.subdomains.length])

          // add the url to the queue as callback
          downloadQueue.push(async () => {
            try {
              await fetch(tileURL + "#tile")
              completedTiles++
              setDownloadProgress(completedTiles)
            } catch (error) {
              console.error(`Failed to download tile: ${tileURL}`, error)
            }
          })
        }
      }
    }

    // update ui
    setTotalTiles(downloadQueue.length)
    setDownloadProgress(0)
    setIsDownloading(true)

    // Process queue with rate limiting
    const RATE_LIMIT = 10 // tiles per second
    const DELAY = 1000 / RATE_LIMIT

    // actually download
    for (const download of downloadQueue) {
      await download()
      //await new Promise(resolve => setTimeout(resolve, DELAY))
    }

    // were done :)
    setIsDownloading(false)
  }

  // handle clearing cache
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
          className="w-full bg-card"
          defaultValue={tileProvider.url}
          placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </div>
      <div>
        <label className="">Sub Domains</label>
        <input
          ref={subDomainRef}
          className="w-full bg-card"
          defaultValue={tileProvider.subdomains.join(", ")}
          placeholder="a, b, c"
        />
      </div>

      <div className="flex flex-row w-full justify-center">
        <Button variant="active" onClick={applyTileProviderChanges}>Apply</Button>
        <Button variant="active" onClick={handleReset}>Reset</Button>
      </div>


      <h2>Offline Support</h2>
      <div>
        <p>Download map and terrain data</p>
        <label>
          <Button variant="active" onClick={downloadTiles} disabled={isDownloading}>
            {isDownloading ? "Downloading" : "Download"}
          </Button>
        </label>
      </div>
      <div>
        <p> Cache Size: {(Math.floor(size.size / 100000) / 10)}mb</p>
        <label>
          <Button variant="active" onClick={clearCache}>Clear Cache</Button>
        </label>
      </div>
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

