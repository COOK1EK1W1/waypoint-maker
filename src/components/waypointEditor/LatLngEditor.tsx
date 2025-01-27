import { AvgLatLng, MoveWPsAvgTo } from "@/util/WPCollection";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { Node, Waypoint } from "@/types/waypoints";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from "react-icons/fa";
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { LuMousePointerClick } from "react-icons/lu";
import { TfiTarget } from "react-icons/tfi";

export function LatLngEditor() {
  const { selectedWPs, waypoints, setWaypoints, activeMission, setTool } = useWaypointContext();

  const mission = waypoints.get(activeMission);
  if (!mission) return null;

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  const [lat, lng] = AvgLatLng(wps, waypoints);

  function nudge(x: number, y: number) {
    setWaypoints((waypoints) => {
      for (let i = 0; i < wpsIds.length; i++) {
        waypoints.changeParam(wpsIds[i], activeMission, (wp: Waypoint) => {
          wp.param5 += 0.0001 * y;
          wp.param6 += 0.0001 * x;
          return wp;
        });
      }
      return waypoints.clone();
    });
  }

  function move() {
    const newLat = prompt("Enter latitude");
    const newLng = prompt("Enter Longitude");
    setWaypoints(MoveWPsAvgTo(Number(newLat), Number(newLng), waypoints, selectedWPs, activeMission))
  }

  function rotateDeg(deg: number) {

    const angleRadians = (deg * Math.PI) / 180;

    setWaypoints((waypoints) => {
      for (let i = 0; i < wps.length; i++) {
        waypoints.changeParam(wpsIds[i], activeMission, (wp: Waypoint) => {
          const x = (wp.param6 - lng) * Math.cos(lat * Math.PI / 180);
          const y = wp.param5 - lat;

          const newX = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
          const newY = x * Math.sin(angleRadians) + y * Math.cos(angleRadians);

          wp.param6 = newX / Math.cos(lat * Math.PI / 180) + lng;
          wp.param5 = newY + lat;

          return wp;
        });
      }
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
