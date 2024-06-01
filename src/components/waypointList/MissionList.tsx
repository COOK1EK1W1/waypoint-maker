import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./ListItem";
import { deleteNode } from "@/util/WPCollection";
import CreateCollection from "./createCollection";
import CollectionItem from "./collectionItem";
import ListItem2 from "./ListItem2";
import { CollectionType, Node } from "@/types/waypoints";

export default function MissionList(){
  const {setActiveMission, waypoints, setSelectedWPs, selectedWPs, setWaypoints, activeMission } = useWaypointContext()

  const mainMission = waypoints.get(activeMission)
  if (mainMission == null) return null

  function handleClick(id: number, e: React.MouseEvent<HTMLDivElement>){
    if (e.metaKey){
      e.stopPropagation()
      if (selectedWPs.includes(id)){
        setSelectedWPs(selectedWPs.filter((wp)=>wp != id))
      }else{
        setSelectedWPs(selectedWPs.concat([id]))
      }
    }else{
      setSelectedWPs([id])

    }
  }

  function onDelete(id: number){
    setSelectedWPs([])
    setWaypoints(deleteNode(id, activeMission, waypoints))
  }

  const hasLanding = Array.from(waypoints.keys()).includes("Landing")
  const hasTakeoff = Array.from(waypoints.keys()).includes("Takeoff")

  function createTakeoff(){
    let newMission: Node[] = []
    let wps = waypoints.set("Takeoff", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints

    main.splice(0, 0, {type: "Collection", collectionID: "Takeoff", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Takeoff"})
    setWaypoints(new Map(wps))
    setActiveMission("Takeoff")
    setSelectedWPs([])
  }

  function createLanding(){
    let newMission: Node[] = [{type: "Waypoint", wps:{frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0}}]
    let wps = waypoints.set("Landing", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints
    main.push({type: "Collection", collectionID: "Landing", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Landing"})
    setWaypoints(new Map(wps))
    setActiveMission("Landing")
    setSelectedWPs([])
  }

  return (
    <div className="flex-grow overflow-auto">
      <h2 className="px-2">{activeMission}</h2>

      {!hasTakeoff && activeMission == "Main" ? 
        <ListItem2 onMouseDown={createTakeoff} className="text-center">
          Add Takeoff
        </ListItem2> : null
      }



      {mainMission.map((waypoint, i) => {
        if (waypoint.type == "Collection"){
          return <CollectionItem node={waypoint} selected={selectedWPs.includes(i)} onMouseDown={(e)=>handleClick(i, e)} key={i} onDelete={()=>onDelete(i)}/>

        }else{
          return <ListItem waypoint={waypoint.wps} selected={selectedWPs.includes(i)} onMouseDown={(e)=>handleClick(i, e)} key={i} onDelete={()=>onDelete(i)}/>
        }
      })}
      {selectedWPs.length > 1 && <CreateCollection/>}

      {!hasLanding && activeMission == "Main" ?
        <ListItem2 onMouseDown={createLanding} className="text-center">
           Add Landing
        </ListItem2>: null
      }
    </div>
  )

}
