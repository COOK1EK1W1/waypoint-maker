import { CollectionType } from "@/types/waypoints"
import { useWaypointContext } from "@/util/context/WaypointContext"

export default function CreateCollection(){
  const {selectedWPs, waypoints, setWaypoints, activeMission, setSelectedWPs} = useWaypointContext()
  function handleGroup(){
    let name: string| null = null
    name = prompt("enter name")
    if (name == null) return

    const curMission = waypoints.get(activeMission)
    if (curMission == undefined) return
    const newWPs = curMission.filter((wp, id) => selectedWPs.includes(id))
    const oldWPs = curMission.filter((wp, id) => !selectedWPs.includes(id))

    if (name.charAt(0) != '_'){
      oldWPs.splice(Math.min(...selectedWPs), 0, {type: "Collection", name: name, ColType: CollectionType.Mission, collectionID: name, offsetLng: 0, offsetLat:0})
      setSelectedWPs([Math.min(...selectedWPs)])
    }else{
      setSelectedWPs([])

    }

    setWaypoints((prev)=>{
      prev.set(activeMission, oldWPs)
      if (name == null) return prev
      prev.set(name, newWPs)
      return new Map(prev)
    })

  }

  return <div>
    <button onMouseDown={handleGroup} className="text-center w-full">Group {selectedWPs.length} waypoints</button>

  </div>
}
