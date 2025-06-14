import { rad2deg } from "@/lib/math/geometry"
import { LatLngAlt } from "@/lib/world/latlng"
import { useMap } from "@/util/context/MapContext"
import { createStore, entries } from "idb-keyval"
import { useEffect, useState } from "react"
import { Circle, LayerGroup, Rectangle } from "react-leaflet"
import { LatLngBounds } from "leaflet"

// get the two db stores
const terStore = createStore('terStore', 'terStore')
const tileStore = createStore('mapStore', 'tileStore')

// Function to calculate tile bounds
function getTileBounds(x: number, y: number, z: number): LatLngBounds {
  const n = Math.pow(2, z)
  const west = x / n * 360 - 180
  const east = (x + 1) / n * 360 - 180
  const north = rad2deg(Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))))
  const south = rad2deg(Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))))
  return new LatLngBounds([south, west], [north, east])
}

export default function Visualisations() {
  const { viewable } = useMap()

  const [terrainData, setTerrainData] = useState<LatLngAlt[]>([])
  const [imagery, setImagery] = useState<string[]>([])

  // watch viewable for changes
  useEffect(() => {
    // display terrain data
    if (viewable["terrain"]) {
      // grab all from db
      entries(terStore).then((data) => {
        setTerrainData(data.map((x) => {
          // parse and set to state
          const [a, b] = String(x[0]).split(',').map(Number)
          return { lat: a, lng: b, alt: x[1] }
        }))
      })
    } else {
      // display nothing
      setTerrainData([])
    }

    if (viewable["imagery"]) {
      // grab all imagery
      entries(tileStore).then((data) => {
        setImagery(data.map(([key, _]) => String(key)))
      })
    } else {
      // display nothing
      setImagery([])
    }
  }, [viewable])

  return (
    <LayerGroup>
      {
        // draw cirlce over loaded terrain data
        terrainData.map((x, i) => (
          <Circle key={i} center={x} radius={200} />
        ))
      }
      {
        imagery.map((key, i) => {
          // show rectangle over downloaded area
          const [_, x, y, z] = String(key).split(":")
          const bounds = getTileBounds(Number(x), Number(y), Number(z))
          return (
            <Rectangle
              key={i}
              bounds={bounds}
              pathOptions={{
                color: '#228B22',
                fillOpacity: 0.05,
                weight: 2
              }}
            />
          )
        })
      }
    </LayerGroup>
  )
}
