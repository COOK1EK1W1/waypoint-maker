import { CollectionType } from "@/lib/mission/mission"
import { useWaypoints } from "@/util/context/WaypointContext"
import { Button } from "../ui/button"

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

  return <Button onClick={handleGroup} className="text-center p-1 m-1 ">Group {selectedWPs.length} waypoints</Button>
}
