"use client"
import VehicleTypeModal from "./vehicleTypeModal"
import { FaHelicopter, FaPlane } from "react-icons/fa"
import { useVehicle } from "@/util/context/VehicleTypeContext"
import Button from "../toolBar/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Plane } from "lucide-react"

export default function VehicleTypeButton() {
  let { vehicle } = useVehicle()
  let button = <></>
  switch (vehicle.type) {
    case "Plane": {
      button = <><Plane className="w-[20px] h-[20px] mr-1" /><span className="grow">Plane</span></>
      break
    }
    case "Copter": {
      button = <><FaHelicopter className="w-[20px] h-[20px] mr-1" /><span>Coper</span></>
      break;
    }
    default: {
      const _exhaustiveCheck: never = vehicle;
      return _exhaustiveCheck
    }

  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-28 justify-start">
          {button}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Vehicle Type</DialogTitle>
        <DialogDescription>Select the vehicle type</DialogDescription>
        <VehicleTypeModal />
      </DialogContent>
    </Dialog>
  )

}
