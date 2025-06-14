"use client"
import VehicleTypeModal from "./vehicleTypeModal"
import { useVehicle } from "@/util/context/VehicleTypeContext"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import { CableCar, Plane } from "lucide-react"
import { Button } from "../ui/button"

export default function VehicleTypeButton() {
  let { vehicle } = useVehicle()
  let button = <></>
  switch (vehicle.type) {
    case "Plane": {
      button = <><Plane /><span className="grow">Plane</span></>
      break
    }
    case "Copter": {
      button = <><CableCar /><span>Copter</span></>
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
        <Button variant="active">
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
