import { get_waypoints } from "@/util/WPCollection";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { gradient, haversineDistance } from "@/util/distance";
import { getTerrain } from "@/util/terrain";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

function interpolate(lat1: number, lat2: number, lng1: number, lng2: number, c: number) {
  return { lat: lat1 * (1 - c) + lat2 * c, lng: lng1 * (1 - c) + lng2 * c }

}

export default function HeightMap() {
  const { activeMission, waypoints } = useWaypointContext()
  const [terrainData, setTerrainData] = useState<{ latitude: number, longitude: number, elevation: number }[]>([])
  const wps = get_waypoints(activeMission, waypoints)
  const throttledValue = useThrottle(waypoints, 2000)

  let locations: [number, number][] = []

  useEffect(() => {
    if (wps.length < 2) return
    getTerrain(locations)
      .then((data) => {
        if (data) setTerrainData(data)
      })
  }, [throttledValue])

  if (wps.length < 2) {
    return (
      <div className="h-[150px] flex w-full items-center justify-center">Place two or more waypoints for height map</div>
    )
  }


  let totalDistance = 0
  for (let i = 1; i < wps.length; i++) {
    totalDistance += haversineDistance(wps[i - 1].param5, wps[i - 1].param6, wps[i].param5, wps[i].param6)
  }

  let terrainDistances = [0]
  for (let i = 1; i < terrainData.length; i++) {
    let distance = haversineDistance(terrainData[i - 1].latitude, terrainData[i - 1].longitude, terrainData[i].latitude, terrainData[i].longitude)
    terrainDistances.push(terrainDistances[i - 1] + distance)
  }

  const interpolatedist = totalDistance / 100
  let distances = [0]
  let heights: (number | null)[] = []
  let gradients: (number | null)[] = [0]
  let prevDistance = 0
  for (let i = 1; i < wps.length; i++) {
    let distance = haversineDistance(wps[i - 1].param5, wps[i - 1].param6, wps[i].param5, wps[i].param6)
    for (let j = 0; j < distance / interpolatedist; j++) {
      distances.push(Math.round(prevDistance + (j / (distance / interpolatedist)) * distance))
      const a = interpolate(wps[i - 1].param5, wps[i].param5, wps[i - 1].param6, wps[i].param6, j / (distance / interpolatedist))
      locations.push([a.lat, a.lng])
      if (j == 0) {
        let curHeight = wps[i - 1].param7
        if (wps[i - 1].type == 22) {
          curHeight = 0
        }
        heights.push(curHeight)
        if (i != 1) {
          let prevHeight = wps[i - 2].param7
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

  heights.push(wps[wps.length - 1].param7)
  let distance = haversineDistance(wps[wps.length - 2].param5, wps[wps.length - 2].param6, wps[wps.length - 1].param5, wps[wps.length - 1].param6)
  gradients.push(gradient(distance, wps[wps.length - 2].param7, wps[wps.length - 1].param7))

  const chartConfig = {
    desktop: {
      label: "Elevation",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  let minTerrainHeight = terrainData[0].elevation
  for (let i = 1; i < terrainData.length; i++) {
    minTerrainHeight = Math.min(terrainData[i].elevation, minTerrainHeight)
  }

  let data: { terrainHeight: number[] | null, waypointHeight: number | null, distance: number }[] = []
  console.log(distances.length, heights.length, terrainData.length)
  for (let i = 0; i < distances.length; i++) {
    if (i < terrainData.length) {
      let terrainHeight = terrainData[i].elevation
      data.push({ terrainHeight: [terrainHeight - terrainData[0].elevation, minTerrainHeight - terrainData[0].elevation - 2], waypointHeight: heights[i], distance: distances[i] })
    } else {
      data.push({ terrainHeight: null, waypointHeight: heights[i], distance: distances[i] })
    }
  }

  return (
    <div>
      <ChartContainer config={chartConfig} className="h-[150px] w-full" >
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
            domain={[minTerrainHeight - terrainData[0].elevation - 2, "dataMax"]}
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
    </div >
  )
}
