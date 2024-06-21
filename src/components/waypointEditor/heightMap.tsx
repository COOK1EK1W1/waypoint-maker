import { get_waypoints } from "@/util/WPCollection";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { gradient, haversineDistance } from "@/util/distance";
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
  useEffect(()=>{
    try{
      fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${location}`)
        .then((x)=>x.json())
        .then((x)=>{
          if (x.results) setTerrainData(x.results)
        })
    }catch (e){
      console.error("whoopsies")

    }
    }, [throttledValue])
  if (wps.length < 2)return

  /*
  let gradients = [0]
  for (let i = 1; i < wps.length; i++){
    let distance = haversineDistance(wps[i-1].param5, wps[i-1].param6, wps[i].param5, wps[i].param6)
    distances.push(distances[i - 1] + distance)
    gradients.push(gradient(distance, wps[i-1].param7, wps[i].param7))
  }
  */

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
  let gradients: (number|null)[] = []
  let prevDistance = 0
  let location = ""
  for (let i = 1; i < wps.length; i++){
    let distance = haversineDistance(wps[i-1].param5, wps[i-1].param6, wps[i].param5, wps[i].param6)
    for (let j = 0; j < distance / interpolatedist; j++){
      distances.push(prevDistance + (j / (distance/interpolatedist))*distance)
      const a = interpolate(wps[i-1].param5, wps[i].param5, wps[i-1].param6, wps[i].param6, j / (distance/interpolatedist))
      location += `${a.lat},${a.lng}|`
      if (j == 0){
        heights.push(wps[i-1].param7)
        gradients.push(gradient(distance, wps[i-1].param7, wps[i].param7))
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
  console.log(gradients)

  return (
    <div>
      <LineChart
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
        height={200}

      />
    </div>
  )
}
