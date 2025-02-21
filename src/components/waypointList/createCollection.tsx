import { CollectionType } from "@/types/waypoints"
import { useWaypoints } from "@/util/context/WaypointContext"

export default function CreateCollection() {
  const { selectedWPs, waypoints, setWaypoints, activeMission, setSelectedWPs } = useWaypoints()
  function handleGroup() {
    let name: string | null = null
    name = prompt("enter name")
    if (name == null) return

    const curMission = waypoints.get(activeMission)
    const newWPs = curMission.filter((_, id) => selectedWPs.includes(id))
    const oldWPs = curMission.filter((_, id) => !selectedWPs.includes(id))

    if (name.charAt(0) != '_') {
      oldWPs.splice(Math.min(...selectedWPs), 0, { type: "Collection", name: name, ColType: CollectionType.Mission, collectionID: name, offsetLng: 0, offsetLat: 0 })
      setSelectedWPs([Math.min(...selectedWPs)])
    } else {
      setSelectedWPs([])
    }

    setWaypoints((waypoints) => {
      if (name == null) return waypoints.clone()
      waypoints.set(activeMission, oldWPs)
      waypoints.set(name, newWPs)
      return waypoints.clone()
    })

  }

  return <div className="w-full flex justify-center">
    <button onMouseDown={handleGroup} className="text-center p-1 m-1 border-2 border-slate-200 rounded-lg bg-slate-100">Group {selectedWPs.length} waypoints</button>

  </div>
}
