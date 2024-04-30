import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./ListItem";
import { deleteNode } from "@/util/WPCollection";
import CreateCollection from "./createCollection";
import CollectionItem from "./collectionItem";

export default function MainMission(){
  const {waypoints, setSelectedWPs, selectedWPs, setWaypoints } = useWaypointContext()
  console.log(waypoints)
  console.log(selectedWPs)

  const mainMission = waypoints.get("main")
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
    setWaypoints(deleteNode(id, "main", waypoints))
  }

  return (
    <div>
      <h2>main mission</h2>
      {mainMission.map((waypoint, i) => {
        if (waypoint.type == "Collection"){
          return <CollectionItem node={waypoint} selected={selectedWPs.includes(i)} onClick={(e)=>handleClick(i, e)} key={i} onDelete={()=>onDelete(i)}/>

        }else{
          return <ListItem waypoint={waypoint.wps} selected={selectedWPs.includes(i)} onClick={(e)=>handleClick(i, e)} key={i} onDelete={()=>onDelete(i)}/>
        }
      })}
      {selectedWPs.length > 1 && <CreateCollection/>}
      
    </div>
  )

}
