import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext";
import Modal from "../modal/modal";
import { defaultCopter, defaultPlane } from "@/util/defaultVehicles";
import Button from "../toolBar/button";

export default function VehicleTypeModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  let { vehicle, setVehicle } = useVehicleTypeContext()
  let content = <></>
  switch (vehicle.type) {
    case "Copter": {
      content = <div>bruh</div>
      break;
    }
    case "Plane": {
      content = <div>
        <div>
          <label>Cruise Airspeed
            <input type="number" value={vehicle.cruiseAirspeed} onChange={(x) => setVehicle((v) => {
              if (v.type != "Plane") return v
              v.cruiseAirspeed = Number(x.target.value)
              return { ...v }
            })}></input>
          </label>
        </div>
        <div>
          <label>Max Bank Angle
            <input type="number" value={vehicle.maxBank} onChange={(x) => setVehicle((v) => {
              if (v.type != "Plane") return v
              v.maxBank = Number(x.target.value)
              return { ...v }
            })}></input>
          </label>
        </div>
        <div>
          <span>Min turn radius</span>
          {Math.round(Math.pow(vehicle.cruiseAirspeed, 2) / (9.8 * Math.tan((vehicle.maxBank * Math.PI) / 180)))}
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
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-row">
        <Button onClick={() => setVehicle(defaultPlane)} className={vehicle.type == "Plane" ? "bg-white" : ""}>Plane</Button>
        <Button onClick={() => setVehicle(defaultCopter)} className={vehicle.type == "Copter" ? "bg-white" : ""}>Copter</Button>
      </div>
      {content}

    </Modal>

  )
}
