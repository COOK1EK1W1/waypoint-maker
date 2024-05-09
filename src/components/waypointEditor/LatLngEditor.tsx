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

  function change(e: React.ChangeEvent<HTMLInputElement>){
    setWaypoints((prevWaypoints) => {
      for (let i = 0; i < wps.length; i++){
        console.log(wpsIds)

        prevWaypoints = changeParam(wpsIds[i], activeMission, prevWaypoints, (wp)=>{
          if (e.target.name == "lng"){
            wp.param6 -= lng - Number(e.target.value)
          }else if (e.target.name == "lat"){
            wp.param5 -= lat - Number(e.target.value)
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
          wp.param5 += 0.0004 * y
          wp.param6 += 0.0004 * x
          return wp
        })
      }
      return new Map(prevWaypoints);
    })
  }


  return <div className="flex flex-row border-2 p-2 rounded-3xl" >
    <div className="flex flex-col place-content-around">
      <div>Latitude <input type="number" name="lat" onChange={change} value={lat} step={0.0001}/></div>
      <div>Longitude <input type="number" name="lng" onChange={change} value={lng} step={0.0001}/></div>
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
  </div>
}
