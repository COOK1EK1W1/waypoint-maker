import { useState } from "react"
import VehicleTypeModal from "./vehicleTypeModal"
import { FaPlane } from "react-icons/fa"
import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext"

export default function VehicleTypeButton(){
  const [open, setOpen] = useState(false)
  let {vehicle} = useVehicleTypeContext()
  switch (vehicle.type){
    //TODO
    case "Plane":{

    }
    case"Copter":{

    }

  }
  return (
    <div className="flex items-center">
      <VehicleTypeModal open={open} onClose={()=>setOpen(false)}/>
      <button className={"p-1 m-1 rounded-lg flex justify-center items-center"} onMouseDown={()=>{setOpen(true)}}>
        <FaPlane/><span> Plane</span>
      </button>
    </div>
  )

}
