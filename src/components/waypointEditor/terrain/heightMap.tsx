import { useWaypoints } from "@/util/context/WaypointContext";
import { getTerrain } from "@/util/terrain";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { ChartConfig } from "@/components/ui/chart";
import { gradient, haversineDistance } from "@/lib/world/distance";
import { filterLatLngAltCmds } from "@/lib/commands/commands";
import { getLatLng, getLatLngAlt, LatLng } from "@/lib/world/latlng";
import DraggableNumberInput from "@/components/ui/draggableNumericInput";
import TerrainChart from "./chart";

function interpolate(a: LatLng, b: LatLng, c: number) {
  return { lat: a.lat * (1 - c) + b.lat * c, lng: a.lng * (1 - c) + b.lng * c }
}

export default function HeightMap() {
  const { activeMission, waypoints, setWaypoints, setSelectedWPs, selectedWPs } = useWaypoints();
  const [terrainData, setTerrainData] = useState<{ loc: LatLng, elevation: number }[]>([]);
  const throttledValue = useThrottle(waypoints, 2000);

  const mission = waypoints.get(activeMission);

  const wps = filterLatLngAltCmds(waypoints.flatten(activeMission));
  const reference = waypoints.getReferencePoint();

  let locations: LatLng[] = [];

  // Get new terrain data throttled
  useEffect(() => {
    if (wps.length < 2) return;
    getTerrain(locations).then((data) => {
      if (data) {
        setTerrainData(data.map((x) => {
          return { loc: { lat: x.latitude, lng: x.longitude }, elevation: x.elevation };
        }));
      }
    });
  }, [throttledValue]);

  if (wps.length < 2) {
    return (
      <div className="h-[150px] flex w-full items-center justify-center">Place two or more waypoints for height map</div>
    );
  }

  let totalDistance = 0;
  for (let i = 1; i < wps.length; i++) {
    totalDistance += haversineDistance(getLatLng(wps[i - 1]), getLatLng(wps[i]));
  }

  let terrainDistances = [0];
  for (let i = 1; i < terrainData.length; i++) {
    let distance = haversineDistance(terrainData[i - 1].loc, terrainData[i].loc);
    terrainDistances.push(terrainDistances[i - 1] + distance);
  }

  const interpolatedist = totalDistance / 100;
  let distances = [0];
  let heights: (number | null)[] = [];
  let gradients: (number | null)[] = [0];
  let prevDistance = 0;
  for (let i = 1; i < wps.length; i++) {
    let distance = haversineDistance(getLatLng(wps[i - 1]), getLatLng(wps[i]));
    if (i === 1) {
      heights.push(wps[0].params.altitude);
      gradients.push(0);
    }
    heights.push(wps[i].params.altitude);
    gradients.push(gradient(distance, wps[i - 1].params.altitude, wps[i].params.altitude));

    for (let j = 0; j < distance / interpolatedist; j++) {
      const a = interpolate(getLatLng(wps[i - 1]), getLatLng(wps[i]), j / (distance / interpolatedist));
      locations.push(a);
    }
    prevDistance += distance;
  }

  if (wps.length === 1) {
    heights.push(wps[0].params.altitude);
    gradients.push(0);
    locations.push(getLatLng(wps[0]));
  }

  if (wps.length > 1 && locations.length > 0) {
    const lastWpLatLng = getLatLng(wps[wps.length - 1]);
    if (locations[locations.length - 1].lat !== lastWpLatLng.lat || locations[locations.length - 1].lng !== lastWpLatLng.lng) {
      locations.push(lastWpLatLng);
    }
  }

  const chartConfig = {
    desktop: {
      label: "Elevation",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  let minTerrainHeight = terrainData[0]?.elevation || 0;
  for (let i = 1; i < terrainData.length; i++) {
    minTerrainHeight = Math.min(terrainData[i].elevation, minTerrainHeight);
  }

  const terrainProfileForChart = terrainData.map((td, index) => ({
    distance: parseFloat(terrainDistances[index]?.toFixed(1) || "0"),
    elevation: td.elevation - terrainData[0].elevation,
  }));

  const commandPositionsForChart = wps.map((wp, i) => ({
    originalIndex: i,
    selected: selectedWPs.includes(i),
    ...getLatLngAlt(wp)
  }));

  const selected = (selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))).map((x) => {
    if (x.type == "Command") {
      return [x.cmd]
    } else {
      return waypoints.flatten(x.name)
    }
  }).flat()

  const values = filterLatLngAltCmds(selected).map(obj => obj.params["altitude"]);
  const allSame = values.every(val => val === values[0]);

  const vals = allSame ? values[0] : null


  function onChange(event: { target: { name: string, value: number } }) {
    setWaypoints((wps) => {
      const newWps = wps.clone()
      mission.forEach((_, i) => {
        if (selectedWPs.length == 0 || selectedWPs.includes(i))
          newWps.changeParam(i, activeMission, (cmd: any) => {
            cmd.params["altitude"] = event.target.value
            return cmd
          })
      })
      return newWps
    })
  }

  const handleCommandClick = (index: number) => {
    setSelectedWPs((prev) => {
      return [index]
    });
  };

  return (
    <div className="w-full p-2">
      <label>
        <span className="block">Altitude</span>
        {/* @ts-ignore */}
        <DraggableNumberInput name="altitude" onChange={onChange} value={vals} />
      </label>
      <TerrainChart
        commandPositions={commandPositionsForChart}
        terrainProfile={terrainProfileForChart}
        onCommandClick={handleCommandClick} // Pass the handler
      />
    </div>
  );
}
