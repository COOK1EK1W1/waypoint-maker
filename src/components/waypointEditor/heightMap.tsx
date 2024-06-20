import { useWaypointContext } from "@/util/context/WaypointContext";

export default function HeightMap(){
  const {activeMission, selectedWPs, waypoints, setWaypoints} = useWaypointContext()

  /*
  let prev = undefined

  let distanceFromPrev = undefined
  let gradientV = undefined
  if (active > 0){
    prev = mission[active-1]
    if (prev.type != "Collection"){
      distanceFromPrev = haversineDistance(current.wps.param5, current.wps.param6, prev.wps.param5, prev.wps.param6)
      gradientV = gradient(distanceFromPrev, (prev || current).wps.param7, current.wps.param7)
    }
    
  }
  */
  return (
    <div>
      {distanceFromPrev && formatDistance(distanceFromPrev)}
      {distanceFromPrev && gradientV}
    </div>
  )
}
