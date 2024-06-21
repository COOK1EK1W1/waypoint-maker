import { useWaypointContext } from "../../util/context/WaypointContext"
import WaypointTypeSelector from "./WaypointTypeSelector";
import { commands } from "@/util/commands";
import { Node, Waypoint } from "@/types/waypoints";
import { changeParam } from "@/util/WPCollection";
import ParameterEditor from "./ParameterEditor";

export default function WaypointEditor(){
  const {activeMission, selectedWPs, waypoints, setWaypoints} = useWaypointContext()




  const mission = waypoints.get(activeMission)
  if (mission == undefined) return null

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  if (wps.length == 0){
    return <div className="h-[80px]"> place a waypoint to begin</div>
  }

  //on change function
  function changeInput(e: React.ChangeEvent<HTMLInputElement>){
    setWaypoints((prevWaypoints: Map<string, Node[]>)=>{
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wpsIds.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {
          let key = e.target.name as keyof Waypoint;
          let a = {...wp}
          a[key] = Number(e.target.value)
          return a
        });
      }
      return waypointsUpdated;
    })
  }

  //on change function
  function changeSelect(e: React.ChangeEvent<HTMLSelectElement>){
    setWaypoints((prevWaypoints: Map<string, Node[]>)=>{
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wpsIds.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {

          const newType = parseInt(e.target.selectedOptions[0].getAttribute('data-cmd') || '0', 10);

          let a = {...wp}
          a.type = newType

          return a
        });
      }
      return waypointsUpdated;
    })
  }

  let allSame = true;
  if (wps[0].type == "Collection") return
  let type = wps[0].wps.type
  for (let i = 1; i < wps.length; i++){
    const a = wps[i]
    if (a.type == "Collection") return
    if (a.wps.type != type){
      allSame = false;
    }
  }
  
  const commanddesc = commands[commands.findIndex(a => wps[0].type=="Waypoint" && a.value==wps[0].wps.type)]


  if (allSame && wps.length > 0){
    return <div className="p-2 flex h-[80px]">
      <WaypointTypeSelector change={changeSelect} wps={wps}/>
      {/*
    {allSame ? 
    <div>
      <span>{commanddesc.description}</span>
    </div>: null
    }
    */}
      <ParameterEditor commanddesc={commanddesc} change={changeInput} wps={wps}/>


    </div>
  }else{
    return (
    <div className="h-80px"> nodes are different types</div>

    )

  }
}
