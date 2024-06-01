import { get_waypoints } from "@/util/WPCollection"
import { useWaypointContext } from "@/util/context/WaypointContext"
import { Severity, wpCheck } from "@/util/wpcheck"

export default function WPCheck(){
  const {waypoints} = useWaypointContext()
  const msg = wpCheck(get_waypoints("Main", waypoints))
  const bad = msg.filter((x) => x[1] == Severity.Bad)

  function onMouseDown(){
    alert(msg.map((x)=>x[0]))
  }

  if (bad.length == 0){
    if (msg.length == 0){

      return (
        <div className="p-1 bg-red-200 w-10 h-10" onMouseDown={onMouseDown}>
          good
        </div>
      )
    }else{
      return (
        <div className="bg-red-200 w-10 h-10" onMouseDown={onMouseDown}>
          med
        </div>
      )

    }


  }else{
    return (
      <div className="m-1 p-4 bg-red-200 rounded-lg" onMouseDown={onMouseDown}>
        Bad
      </div>

    )
  }


}
