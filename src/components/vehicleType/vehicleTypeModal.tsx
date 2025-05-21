import { useVehicle } from "@/util/context/VehicleTypeContext";
import DraggableNumberInput from "../ui/draggableNumericInput";
import { getMinTurnRadius } from "@/lib/dubins/dubinWaypoints";
import { defaultCopter, defaultPlane } from "@/lib/vehicles/defaults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function VehicleTypeModal() {
  let { vehicle, setVehicle } = useVehicle()

  return (
    <div>
      <Tabs value={vehicle.type}>

        <TabsList>
          <TabsTrigger value="Plane" onClick={() => setVehicle(defaultPlane)}>Plane</TabsTrigger>
          <TabsTrigger value="Copter" onClick={() => setVehicle(defaultCopter)}>Copter</TabsTrigger>
        </TabsList>

        <TabsContent value="Plane">
          {vehicle.type == "Plane" ? <>
            <div className="grid grid-cols-2 justify-middle py-4">
              <label className="flex-col flex w-40 justify-self-center">
                <span>Cruise Airspeed</span>
                <DraggableNumberInput name="Airspeed" value={vehicle.cruiseAirspeed} className="w-40" onChange={(x) => setVehicle((v) => {
                  if (v.type != "Plane") return v
                  v.cruiseAirspeed = Number(x.target.value)
                  return { ...v }
                })} />
              </label>
              <label className="flex-col flex w-40 justify-self-center">
                <span>Max Bank Angle</span>
                <DraggableNumberInput name="Max Bank" value={vehicle.maxBank} className="w-40" onChange={(x) => setVehicle((v) => {
                  if (v.type != "Plane") return v
                  v.maxBank = Number(x.target.value)
                  return { ...v }

                })} />
              </label>
              <label className="flex-col flex w-40 justify-self-center">
                <span>Energy Constant (wh/km)</span>
                <DraggableNumberInput name="Energy Constant" min={0} value={vehicle.energyConstant} className="w-40" onChange={(x) => setVehicle((v) => {
                  if (v.type != "Plane") return v
                  v.energyConstant = Number(x.target.value)
                  return { ...v }

                })} />
              </label>
            </div>
            <div>
              <span>Minimum turning radius: {getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed).toFixed(1)}m</span>
            </div>
          </> : null}
        </TabsContent>

        <TabsContent value="Copter">
          <div>Coming Soon</div>
        </TabsContent>

      </Tabs>
    </div >

  )
}
