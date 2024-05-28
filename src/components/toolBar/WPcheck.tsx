import { get_waypoints } from "@/util/WPCollection"
import { useWaypointContext } from "@/util/context/WaypointContext"
import { Severity, wpCheck } from "@/util/wpcheck"

export default function WPCheck(){
  const {waypoints} = useWaypointContext()
  const msg = wpCheck(get_waypoints("Main", waypoints))
  console.log(msg)
  const bad = msg.filter((x) => x[1] == Severity.Bad)

  function onClick(){
    alert(msg.map((x)=>x[0]))
  }

  if (bad.length == 0){
    if (msg.length == 0){

      return (
        <div className="bg-red-200 w-10 h-10" onClick={onClick}>
          good

        </div>
      )
    }else{
      return (
        <div className="bg-red-200 w-10 h-10" onClick={onClick}>
          med

        </div>
      )

    }


  }else{
    return (
      <div className="bg-red-200 w-10 h-10" onClick={onClick}>
        Bad

      </div>

    )
  }


}
