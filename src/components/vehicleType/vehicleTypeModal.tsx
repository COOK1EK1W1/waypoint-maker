import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext";
import { defaultCopter, defaultPlane } from "@/util/defaultVehicles";
import Button from "../toolBar/button";
import DraggableNumberInput from "../ui/draggableNumericInput";
import { getMinTurnRadius } from "@/lib/dubins/dubinWaypoints";
import { cn } from "@/lib/utils";

export default function VehicleTypeModal() {
  let { vehicle, setVehicle } = useVehicleTypeContext()
  let content = <></>
  switch (vehicle.type) {
    case "Copter": {
      content = <div>Coming Soon</div>
      break;
    }
    case "Plane": {
      content = <div>
        <div className="flex flex-row justify-around py-4">
          <label className="flex-col flex w-40">
            <span>Cruise Airspeed</span>
            <DraggableNumberInput value={vehicle.cruiseAirspeed} className="w-40" onChange={(x) => setVehicle((v) => {
              if (v.type != "Plane") return v
              v.cruiseAirspeed = Number(x.target.value)
              return { ...v }
            })} />
          </label>
          <label className="flex-col flex w-40">
            <span>Max Bank Angle</span>
            <DraggableNumberInput value={vehicle.maxBank} className="w-40" onChange={(x) => setVehicle((v) => {
              if (v.type != "Plane") return v
              v.maxBank = Number(x.target.value)
              return { ...v }

            })} />
          </label>
          <label className="flex-col flex w-40">
            <span>Energy Constant (wh/km)</span>
            <DraggableNumberInput min={0} value={vehicle.energyConstant} className="w-40" onChange={(x) => setVehicle((v) => {
              if (v.type != "Plane") return v
              v.energyConstant = Number(x.target.value)
              return { ...v }

            })} />
          </label>
        </div>
        <div>
          <span>Min turn radius:
            {getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed).toFixed(1)}m</span>
        </div>

      </div>
      break;
    }
    default: {
      const _exhaustiveCheck: never = vehicle;
      return _exhaustiveCheck
    }
  }
  return (
    <div>
      <div className="flex flex-row">
        <Button onClick={() => setVehicle(defaultPlane)} className={cn("w-28", vehicle.type != "Plane" ? "bg-white" : "")}>Plane</Button>
        <Button onClick={() => setVehicle(defaultCopter)} className={cn("w-28", vehicle.type != "Copter" ? "bg-white" : "")}>Copter</Button>
      </div>
      {content}

    </div>

  )
}
