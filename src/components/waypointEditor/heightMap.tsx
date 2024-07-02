import { get_waypoints } from "@/util/WPCollection";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { gradient, haversineDistance } from "@/util/distance";
import { getTerrain } from "@/util/terrain";
import { LineChart } from "@mui/x-charts";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

function interpolate(lat1: number, lat2: number, lng1: number, lng2: number, c: number){
  return {lat: lat1 * (1-c) + lat2 * c, lng: lng1 * (1-c) + lng2 * c}

}

export default function HeightMap(){
  const {activeMission, waypoints} = useWaypointContext()
  const [terrainData, setTerrainData] = useState<{latitude: number, longitude: number, elevation: number}[]>([])
  const wps = get_waypoints(activeMission, waypoints)
  const throttledValue = useThrottle(waypoints, 2000)

  let locations: [number, number][] = []

  useEffect(()=>{
    if (wps.length < 2) return
    getTerrain(locations)
      .then((data)=>{
        if (data) setTerrainData(data)
      })
  }, [throttledValue])

  if (wps.length < 2){
    return (
      <div className="h-[150px] flex w-full items-center justify-center">Place two or more waypoints for height map</div>
    )
  }


  let totalDistance = 0
  for (let i = 1; i < wps.length; i++){
    totalDistance += haversineDistance(wps[i-1].param5, wps[i-1].param6, wps[i].param5, wps[i].param6)
  }

  let terrainDistances = [0]
  for (let i = 1; i < terrainData.length; i++){
    let distance = haversineDistance(terrainData[i-1].latitude, terrainData[i-1].longitude, terrainData[i].latitude, terrainData[i].longitude)
    terrainDistances.push(terrainDistances[i - 1] + distance)
  }

  const interpolatedist = totalDistance / 100
  let distances = [0]
  let heights: (number|null)[] = []
  let gradients: (number|null)[] = [0]
  let prevDistance = 0
  for (let i = 1; i < wps.length; i++){
    let distance = haversineDistance(wps[i-1].param5, wps[i-1].param6, wps[i].param5, wps[i].param6)
    for (let j = 0; j < distance / interpolatedist; j++){
      distances.push(prevDistance + (j / (distance/interpolatedist))*distance)
      const a = interpolate(wps[i-1].param5, wps[i].param5, wps[i-1].param6, wps[i].param6, j / (distance/interpolatedist))
      locations.push([a.lat, a.lng])
      if (j == 0){
        let curHeight = wps[i-1].param7
        if (wps[i-1].type==22){
          curHeight = 0
        }
        heights.push(curHeight)
        if (i != 1){
          let prevHeight = wps[i-2].param7
          if (wps[i-2].type==22){
            prevHeight = 0
          }
          gradients.push(gradient(distance, prevHeight, curHeight))
        }
      }else{
        heights.push(null)
        gradients.push(null)
      }
    }
    prevDistance += distance
  }

  heights.push(wps[wps.length-1].param7)
  let distance = haversineDistance(wps[wps.length-2].param5, wps[wps.length-2].param6, wps[wps.length - 1].param5, wps[wps.length -1].param6)
  gradients.push(gradient(distance, wps[wps.length-2].param7, wps[wps.length-1].param7))

  return (
    <div>
      <LineChart
        slotProps={{legend: {hidden: true}}}
        xAxis={[
          {data: distances}
        ]}
        series={[
          {
            label: "Waypoint",
            curve: "linear",
            data: heights.slice(0, distances.length),
            valueFormatter: (v, {dataIndex})=>{
              const grad = gradients[dataIndex]
              if (grad !== null && v !== null){
              return `${v}m ${grad<0 ? "↘ ": grad > 0? "↗ ": "→ "}${grad}°`
              }
              return ``
            },
            connectNulls: true,
          },
          {
            label: "Terrain",
            data: terrainData.map((x)=>(x.elevation - terrainData[0].elevation||0)).slice(0, distances.length),
            showMark: false,
            valueFormatter: (v, {dataIndex})=>{
              return `${v}m`
            },
          }
        ]}
        height={150}
        margin={{left:44, right: 10, top: 20, bottom: 26}}

      />
    </div>
  )
}
