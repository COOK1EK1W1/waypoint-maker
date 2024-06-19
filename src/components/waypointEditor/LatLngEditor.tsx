import { AvgLatLng, MoveWPsAvgTo, changeParam } from "@/util/WPCollection";
import { Tool} from '@/types/tools'
import { useWaypointContext } from "../../util/context/WaypointContext";
import { Node, Waypoint } from "@/types/waypoints";

export function LatLngEditor(){
  const { selectedWPs, waypoints, setWaypoints, activeMission, setTool} = useWaypointContext();

  const mission: Node[] | undefined = waypoints.get(activeMission);
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
    setWaypoints((prevWaypoints: Map<string, Node[]>) => {
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wpsIds.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {
          wp.param5 += 0.0001 * y;
          wp.param6 += 0.0001 * x;
          return wp;
        });
      }
      return waypointsUpdated;
    });
  }

  function move() {
    const newLat = prompt("Enter latitude");
    const newLng = prompt("Enter Longitude");
    setWaypoints(MoveWPsAvgTo(Number(newLat), Number(newLng), waypoints, selectedWPs, activeMission))
  }


  function rotate() {
    const angleDegrees = prompt("Enter rotation angle in degrees");
    if (!angleDegrees) return;

    const angleRadians = (Number(angleDegrees) * Math.PI) / 180;

    setWaypoints((prevWaypoints: Map<string, Node[]>) => {
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wps.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {
          const x = (wp.param6 - lng) * Math.cos(lat * Math.PI / 180);
          const y = wp.param5 - lat;

          const newX = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
          const newY = x * Math.sin(angleRadians) + y * Math.cos(angleRadians);

          wp.param6 = newX / Math.cos(lat * Math.PI / 180) + lng;
          wp.param5 = newY + lat;

          return wp;
        });
      }
      return waypointsUpdated;
    });
  }

  function place(){
    setTool("Place")

  }

  return (
    <div className="flex flex-row border-2 p-2 rounded-3xl">
      <div className="flex flex-col place-content-around">
        <p>Latitude: {lat.toFixed(6)} Longitude: {lng.toFixed(6)}</p>
      </div>
      <div>
        <div className="flex flex-row">
          <div className="w-8 h-8"></div>
          <button className="w-8 h-8" onMouseDown={()=>{nudge(0, 1)}}>up</button>
          <div className="w-8 h-8"></div>
        </div>
        <div className="flex flex-row">
          <button className="w-8 h-8" onMouseDown={()=>{nudge(-1, 0)}}>left</button>
          <div className="w-8 h-8"></div>
          <button className="w-8 h-8" onMouseDown={()=>{nudge(1, 0)}}>rigt</button>
        </div>
        <div className="flex flex-row">
          <div className="w-8 h-8"></div>
          <button className="w-8 h-8" onMouseDown={()=>{nudge(0,-1)}}>dwn</button>
          <div className="w-8 h-8"></div>
        </div>
      </div>
      <div>
        <button onMouseDown={move}> move</button>
        <button onMouseDown={rotate}> rotate</button>
        <button onMouseDown={place}> place</button>
      </div>
    </div>
  );
};
