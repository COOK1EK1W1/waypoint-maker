import { useWaypoints } from "@/util/context/WaypointContext";
import { getTerrain } from "@/util/terrain";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { gradient, haversineDistance } from "@/lib/world/distance";
import { filterLatLngAltCmds } from "@/lib/commands/commands";
import { getLatLng, LatLng } from "@/lib/world/latlng";

function interpolate(a: LatLng, b: LatLng, c: number) {
  return { lat: a.lat * (1 - c) + b.lat * c, lng: a.lng * (1 - c) + b.lng * c }
}

export default function HeightMap() {
  const { activeMission, waypoints } = useWaypoints()
  const [terrainData, setTerrainData] = useState<{ loc: LatLng, elevation: number }[]>([])
  const throttledValue = useThrottle(waypoints, 2000)

  const wps = filterLatLngAltCmds(waypoints.flatten(activeMission))
  const reference = waypoints.getReferencePoint()

  let locations: LatLng[] = []

  // get new terrain data throttled
  useEffect(() => {
    if (wps.length < 2) return
    getTerrain(locations)
      .then((data) => {
        if (data) {
          setTerrainData(data.map((x) => {
            return {
              loc: { lat: x.latitude, lng: x.longitude }, elevation: x.elevation
            }
          }))
        }
      })
  }, [throttledValue])

  if (wps.length < 2) {
    return (
      <div className="h-[150px] flex w-full items-center justify-center">Place two or more waypoints for height map</div>
    )
  }


  let totalDistance = 0
  for (let i = 1; i < wps.length; i++) {
    totalDistance += haversineDistance(getLatLng(wps[i - 1]), getLatLng(wps[i]))
  }

  let terrainDistances = [0]
  for (let i = 1; i < terrainData.length; i++) {
    let distance = haversineDistance(terrainData[i - 1].loc, terrainData[i].loc)
    terrainDistances.push(terrainDistances[i - 1] + distance)
  }

  const interpolatedist = totalDistance / 100
  let distances = [0]
  let heights: (number | null)[] = []
  let gradients: (number | null)[] = [0]
  let prevDistance = 0
  for (let i = 1; i < wps.length; i++) {
    let distance = haversineDistance(getLatLng(wps[i - 1]), getLatLng(wps[i]))
    for (let j = 0; j < distance / interpolatedist; j++) {
      distances.push(Math.round(prevDistance + (j / (distance / interpolatedist)) * distance))
      const a = interpolate(getLatLng(wps[i - 1]), getLatLng(wps[i]), j / (distance / interpolatedist))
      locations.push(a)
      if (j == 0) {
        let curHeight = wps[i - 1].params.altitude
        if (wps[i - 1].type == 22) {
          curHeight = 0
        }
        heights.push(curHeight)
        if (i != 1) {
          let prevHeight = wps[i - 2].params.altitude
          if (wps[i - 2].type == 22) {
            prevHeight = 0
          }
          gradients.push(gradient(distance, prevHeight, curHeight))
        }
      } else {
        heights.push(null)
        gradients.push(null)
      }
    }
    prevDistance += distance
  }

  heights.push(wps[wps.length - 1].params.altitude)
  let distance = haversineDistance(getLatLng(wps[wps.length - 2]), getLatLng(wps[wps.length - 1]))
  gradients.push(gradient(distance, wps[wps.length - 2].params.altitude, wps[wps.length - 1].params.altitude))

  const chartConfig = {
    desktop: {
      label: "Elevation",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  let minTerrainHeight = terrainData[0]?.elevation || 0
  for (let i = 1; i < terrainData.length; i++) {
    minTerrainHeight = Math.min(terrainData[i].elevation, minTerrainHeight)
  }

  let data: { terrainHeight: number[] | null, waypointHeight: number | null, distance: number }[] = []
  //console.log(distances.length, heights.length, terrainData.length)
  for (let i = 0; i < distances.length; i++) {
    if (i < terrainData.length) {
      let terrainHeight = terrainData[i].elevation
      data.push({ terrainHeight: [terrainHeight - terrainData[0].elevation, minTerrainHeight - terrainData[0].elevation - 2], waypointHeight: heights[i], distance: distances[i] })
    } else {
      data.push({ terrainHeight: null, waypointHeight: heights[i], distance: distances[i] })
    }
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full" >
      <ComposedChart
        accessibilityLayer
        data={data}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="distance"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          dataKey="waypointHeight"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[minTerrainHeight - terrainData[0]?.elevation || 0 - 2, "dataMax"]}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="terrainHeight"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
        <Line
          dataKey="waypointHeight"
          type="linear"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={true}
          connectNulls={true}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
