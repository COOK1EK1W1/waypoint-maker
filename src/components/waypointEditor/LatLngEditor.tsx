import { AvgLatLng, changeParam } from "@/util/WPCollection";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { Node } from "@/types/waypoints";

export function LatLngEditor(){
  const {selectedWPs, waypoints, setWaypoints, activeMission} = useWaypointContext()

  const mission = waypoints.get(activeMission)
  if (mission == undefined) return

  let wps: Node[] = []
  let wpsIds: number[] = []
  if (selectedWPs.length == 0){
    wps = mission
    wpsIds = [...Array.from(Array(mission.length).keys())]
  }else{
    wps = mission.filter((node, id)=>{return selectedWPs.includes(id)})
    wpsIds = selectedWPs
  }

  const [lat, lng] = AvgLatLng(wps, waypoints)
  console.log(lat, lng)

  function change(e: React.ChangeEvent<HTMLInputElement>){
    setWaypoints((prevWaypoints) => {
      for (let i = 0; i < wps.length; i++){
        console.log(wpsIds)

        prevWaypoints = changeParam(wpsIds[i], activeMission, prevWaypoints, (wp)=>{
          if (e.target.name == "lng"){
            wp.param6 = Number(e.target.value)
          }else if (e.target.name == "lat"){
            wp.param5 = Number(e.target.value)
          }
          return wp
        })
      }
      return new Map(prevWaypoints);
    })
  }

  function nudge(x: number, y: number){
    setWaypoints((prevWaypoints) => {
      for (let i = 0; i < wpsIds.length; i++){
        prevWaypoints = changeParam(wpsIds[i], activeMission, prevWaypoints, (wp)=>{
          wp.param5 += 0.0001 * y
          wp.param6 += 0.0001 * x
          return wp
        })
      }
      return new Map(prevWaypoints);
    })
  }

  function move(){
    let newLat = prompt("enter latitude")
    let newLng = prompt("enter Longitude")

    let prevWaypoints = waypoints
    for (let i = 0; i < wps.length; i++){
      console.log(wpsIds)

      prevWaypoints = changeParam(wpsIds[i], activeMission, prevWaypoints, (wp)=>{
        if (newLng == null || newLat == null){
          return wp
        }
        console.log(wp.param6, newLng, lng)
        wp.param5 = wp.param5 + (Number(newLat) - lat)
        wp.param6 = wp.param6 + (Number(newLng) - lng)
        return wp
      })
    }
    const a = new Map(prevWaypoints);

    setWaypoints(a)
  }


  function rotate() {
  let angleDegrees = prompt("Enter rotation angle in degrees");

  // Convert angle from degrees to radians
  let angleRadians = (Number(angleDegrees) * Math.PI) / 180;

  let prevWaypoints = waypoints;
  for (let i = 0; i < wps.length; i++) {
    console.log(wpsIds);

    prevWaypoints = changeParam(wpsIds[i], activeMission, prevWaypoints, (wp) => {
      // Convert waypoint coordinates to Cartesian coordinates
      let x = (wp.param6 - lng) * Math.cos(lat * Math.PI / 180);
      let y = wp.param5 - lat;

      // Apply rotation
      let newX = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
      let newY = x * Math.sin(angleRadians) + y * Math.cos(angleRadians);

      // Convert back to latitude and longitude
      wp.param6 = (newX / Math.cos(lat * Math.PI / 180)) + lng;
      wp.param5 = newY + lat;

      return wp;
    });
  }
  
  const a = new Map(prevWaypoints);
  setWaypoints(a);
}


  return <div className="flex flex-row border-2 p-2 rounded-3xl" >
    <div className="flex flex-col place-content-around">
      <p>latitude: {lat} Longitude : {lng}</p>
    </div>
    <div>
      <div className="flex flex-row">
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(0, 1)}}>up</button>
        <div className="w-8 h-8"></div>
        </div>
      <div className="flex flex-row">
        <button className="w-8 h-8" onClick={()=>{nudge(-1, 0)}}>left</button>
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(1, 0)}}>rigt</button>
      </div>
      <div className="flex flex-row">
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(0,-1)}}>dwn</button>
        <div className="w-8 h-8"></div>
      </div>
    </div>
    <div>
      <button onClick={move}> move</button>
      <button onClick={rotate}> rotate</button>
    </div>
  </div>
}
