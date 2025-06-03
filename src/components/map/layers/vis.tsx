import { LatLngAlt } from "@/lib/world/latlng"
import { useMap } from "@/util/context/MapContext"
import { createStore, entries } from "idb-keyval"
import { useEffect, useState } from "react"
import { Circle, LayerGroup } from "react-leaflet"

const terStore = createStore('terStore', 'terStore')

export default function Visualisations() {
  const { viewable } = useMap()
  const [terrainData, setTerrainData] = useState<LatLngAlt[]>([])
  useEffect(() => {
    if (viewable["terrain"]) {
      entries(terStore).then((data) => {
        setTerrainData(data.map((x) => {
          const [a, b] = String(x[0]).split(',').map(Number)
          return { lat: a, lng: b, alt: x[1] }
        }))
      })
    } else {
      setTerrainData([])
    }
  }, [viewable])
  console.log(terrainData)
  return (
    <LayerGroup>
      {
        terrainData.map((x) => (
          <Circle center={x} radius={200} />
        ))
      }

    </LayerGroup>
  )
}
