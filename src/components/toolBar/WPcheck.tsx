import { get_waypoints } from "@/util/WPCollection"
import { useWaypointContext } from "@/util/context/WaypointContext"
import { cn } from "@/util/tw"
import { Severity, wpCheck } from "@/util/wpcheck"
import { FaCheck } from "react-icons/fa"
import { FaX } from "react-icons/fa6"
import { MdErrorOutline } from "react-icons/md"

export default function WPCheck(){
  const {waypoints} = useWaypointContext()
  const msg = wpCheck(get_waypoints("Main", waypoints))
  const bad = msg.filter((x) => x[1] == Severity.Bad)

  function onMouseDown(){
    alert(msg.map((x)=>x[0]))
  }


  let text: any = ""
  let color = ""
  if (bad.length == 0){
    if (msg.length == 0){
      color = "bg-green-200" 
      text = <FaCheck/>
    }else{
      color = "bg-amber-200" 
      text = <MdErrorOutline/>
      text = "med"
    }
  }else{
    color = "bg-red-200" 
    text = <FaX/>
  }

  return (
    <div className="flex">
      <div className={cn("p-1 m-1 rounded aspect-square flex justify-center items-center", color)} onMouseDown={onMouseDown}>
        {text}
      </div>
      {bad.length > 0 ?
        <p>{bad[0][0]}</p>: null
      }
    </div>
  )

}
