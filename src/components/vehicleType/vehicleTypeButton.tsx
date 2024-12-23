import { useState } from "react"
import VehicleTypeModal from "./vehicleTypeModal"
import { FaHelicopter, FaPlane } from "react-icons/fa"
import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext"

export default function VehicleTypeButton(){
  const [open, setOpen] = useState(false)
  let {vehicle} = useVehicleTypeContext()
  let button = <></>
  switch (vehicle.type){
    case "Plane":{
      button = <><FaPlane/><span> Plane</span></>
      break
    }
    case "Copter":{
      button = <><FaHelicopter/><span>Coper</span></>
      break;
    }
    default: {
      const _exhaustiveCheck: never = vehicle;
      return _exhaustiveCheck
    }

  }
  return (
    <div className="flex items-center">
      <VehicleTypeModal open={open} onClose={()=>setOpen(false)}/>
      <button className={"p-1 m-1 rounded-lg flex justify-center items-center"} onMouseDown={()=>{setOpen(true)}}>
        {button}
      </button>
    </div>
  )

}
