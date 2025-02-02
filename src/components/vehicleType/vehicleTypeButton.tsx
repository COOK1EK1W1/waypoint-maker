"use client"
import VehicleTypeModal from "./vehicleTypeModal"
import { FaHelicopter, FaPlane } from "react-icons/fa"
import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext"
import Button from "../toolBar/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"

export default function VehicleTypeButton() {
  let { vehicle } = useVehicleTypeContext()
  let button = <></>
  switch (vehicle.type) {
    case "Plane": {
      button = <><FaPlane /><span> Plane</span></>
      break
    }
    case "Copter": {
      button = <><FaHelicopter /><span>Coper</span></>
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
        <Button className="w-28">
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
