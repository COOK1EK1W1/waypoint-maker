import { useWaypoints } from "@/util/context/WaypointContext";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from "react-icons/fa";
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { LuMousePointerClick } from "react-icons/lu";
import { TfiTarget } from "react-icons/tfi";
import { Command, filterLatLngCmds } from "@/lib/commands/commands";
import { avgLatLng, getLatLng } from "@/lib/world/latlng";
import { Node } from "@/lib/mission/mission";

export function LatLngEditor() {
  const { selectedWPs, waypoints, setWaypoints, activeMission, setTool } = useWaypoints();

  const mission = waypoints.get(activeMission);

  // all nodes if selected has none, or selected nodes
  let wps: Node[] = selectedWPs.length === 0 ? mission : mission.filter((_, id) => selectedWPs.includes(id));

  // all indexes if selected has none, or all selected indexes
  let wpsIds: number[] = selectedWPs.length === 0 ? mission.map((_, index) => index) : selectedWPs

  const leaves = wps.map((x) => waypoints.flattenNode(x)).reduce((cur, acc) => (acc.concat(cur)), [])

  const avgll = avgLatLng(filterLatLngCmds(leaves).map(getLatLng))
  if (avgll == undefined) {
    return null
  }
  const { lat, lng } = avgll

  function nudge(x: number, y: number) {
    setWaypoints((waypoints) => {
      wpsIds.forEach(wpsId => {
        waypoints.changeParam(wpsId, activeMission, (cmd: Command) => {
          if ("latitude" in cmd.params) {
            cmd.params.latitude += 0.0001 * y;
            cmd.params.longitude += 0.0001 * x;
          }
          return cmd;
        });
      })
      return waypoints.clone();
    });
  }

  function move() {
    const inLat = prompt("Enter latitude");
    const inLng = prompt("Enter Longitude");
    if (inLat === null || inLng === null) { return }
    const newLat = parseFloat(inLat)
    const newLng = parseFloat(inLng)
    setWaypoints((mission) => {
      const leaves = wps.map((x) => waypoints.flattenNode(x)).reduce((cur, acc) => (acc.concat(cur)), [])

      const avgll = avgLatLng(filterLatLngCmds(leaves).map(getLatLng))
      if (avgll == undefined) { return waypoints }
      const { lat, lng } = avgll
      let waypointsUpdated = mission.clone();
      wpsIds.forEach(wpsId => {
        waypointsUpdated.changeParam(wpsId, activeMission, (cmd: Command) => {
          if ("latitude" in cmd.params && "longitude" in cmd.params) {
            cmd.params.latitude += newLat - lat
            cmd.params.longitude += newLng - lng
          }
          return cmd;
        });
      })
      return waypointsUpdated;
    })
  }

  function rotateDeg(deg: number) {

    const angleRadians = (deg * Math.PI) / 180;

    setWaypoints((waypoints) => {
      wpsIds.forEach(wpsId => {
        waypoints.changeParam(wpsId, activeMission, (cmd: Command) => {
          if ("latitude" in cmd.params) {

            const x = (cmd.params.longitude - lng) * Math.cos(lat * Math.PI / 180);
            const y = cmd.params.latitude - lat;

            const newX = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
            const newY = x * Math.sin(angleRadians) + y * Math.cos(angleRadians);

            cmd.params.longitude = newX / Math.cos(lat * Math.PI / 180) + lng;
            cmd.params.latitude = newY + lat;
          }

          return cmd;
        });
      })
      return waypoints.clone();
    });
  }

  function rotate() {
    const angleDegrees = prompt("Enter rotation angle in degrees");
    if (!angleDegrees) return;
    rotateDeg(Number(angleDegrees))
  }

  function place() {
    setTool("Place")
  }

  return (
    <>
      <div className="p-2">
        <label><span className="ml-[4px]">Latitude</span>
          <div className="border-2 border-slate-200 rounded-lg w-40 flex overflow-hidden">
            <button onMouseDown={() => nudge(0, -1)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowDown className="inline" /></button>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <span className="flex-grow text-center">{lat.toFixed(6)}</span>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <button onMouseDown={() => nudge(0, 1)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowUp className="inline" /></button>
          </div>
        </label>
      </div>
      <div className="p-2">
        <label><span className="ml-[4px]">Longitude</span>
          <div className="border-2 border-slate-200 rounded-lg w-40 flex overflow-hidden">
            <button onMouseDown={() => nudge(-1, 0)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowLeft className="inline" /></button>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <span className="flex-grow text-center">{lng.toFixed(6)}</span>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <button onMouseDown={() => nudge(1, 0)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowRight className="inline" /></button>
          </div>
        </label>
      </div>
      <div className="p-2">
        <label><span className="ml-[4px]"></span>
          <div className="border-2 border-slate-200 rounded-lg w-40 overflow-hidden flex">
            <button onMouseDown={move} className="h-[21px] flex-grow bg-slate-100 flex items-center justify-evenly"><TfiTarget className="inline" />Move</button>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <button onMouseDown={place} className="h-[21px] flex-grow bg-slate-100 flex items-center justify-evenly"><LuMousePointerClick className="inline" />Place</button>
          </div>
        </label>
      </div>
      {selectedWPs.length == 0 || selectedWPs.length > 1 ? <div className="p-2">
        <label><span className="ml-[4px]"></span>
          <div className="border-2 border-slate-200 rounded-lg w-40 flex overflow-hidden">
            <button onMouseDown={() => rotateDeg(5)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowRotateLeft className="inline" /></button>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <button onMouseDown={rotate} className="flex-grow text-center bg-slate-100">rotate</button>
            <span className="w-[2px] bg-slate-200 h-[100%] h-[21px]" />
            <button onMouseDown={() => rotateDeg(-5)} className="h-[21px] w-[21px] flex items-center justify-center bg-slate-100"><FaArrowRotateRight className="inline" /></button>
          </div>
        </label>
      </div> : null}
    </>
  );
};
