import { useWaypoints } from "@/util/context/WaypointContext";
import { getTerrain } from "@/util/terrain";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
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
  const wpsLocs = wps.map(getLatLngAlt)
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


  // 1. Calculate total distance between waypoints
  let computedTotalDistance = 0;
  for (let i = 0; i < wps.length - 1; i++) {
    computedTotalDistance += haversineDistance(getLatLng(wps[i]), getLatLng(wps[i + 1]));
  }

  // 2. Calculate waypoint altitudes, gradients, and cumulative distances
  const waypointAltitudes: number[] = [wps[0].params.altitude];
  const waypointGradients: number[] = [0]; // Gradient at the first waypoint is 0
  const waypointCumulativeDistances: number[] = [0];

  let currentCumulativeWpDistance = 0;
  for (let i = 0; i < wps.length - 1; i++) {
    const wp1 = wps[i];
    const wp2 = wps[i + 1];
    const loc1 = getLatLng(wp1);
    const loc2 = getLatLng(wp2);
    const segmentDistance = haversineDistance(loc1, loc2);

    waypointAltitudes.push(wp2.params.altitude);
    waypointGradients.push(gradient(segmentDistance, wp1.params.altitude, wp2.params.altitude));

    currentCumulativeWpDistance += segmentDistance;
    waypointCumulativeDistances.push(currentCumulativeWpDistance);
  }

  // 3. Populate the component-scoped 'locations' array for the getTerrain useEffect hook
  locations.length = 0; // Clear array before repopulating

  if (wps.length > 0) { // Should be wps.length >= 2 here
    locations.push(getLatLng(wps[0]));
    const interpolatedStepSize = computedTotalDistance > 0 ? computedTotalDistance / 100 : 0;

    if (interpolatedStepSize > 0) {
      for (let i = 0; i < wps.length - 1; i++) { // Iterate through segments
        const p1 = getLatLng(wps[i]);
        const p2 = getLatLng(wps[i + 1]);
        const segmentDist = haversineDistance(p1, p2);

        if (segmentDist > 0) {
          // Calculate number of interpolation points strictly between p1 and p2
          const numInterpolationIntervals = Math.floor(segmentDist / interpolatedStepSize);
          for (let j = 1; j < numInterpolationIntervals; j++) {
            const fraction = j / numInterpolationIntervals;
            locations.push(interpolate(p1, p2, fraction));
          }
        }
        // Add p2, ensuring it's distinct from the last point added to 'locations'
        if (locations.length === 0 || locations[locations.length - 1].lat !== p2.lat || locations[locations.length - 1].lng !== p2.lng) {
          locations.push(p2);
        }
      }
    } else { // No valid step size for interpolation (e.g., totalDistance is 0)
      // Add all unique waypoints to locations if not already present.
      for (let i = 1; i < wps.length; i++) {
        const nextLoc = getLatLng(wps[i]);
        if (locations.length === 0 || locations[locations.length - 1].lat !== nextLoc.lat || locations[locations.length - 1].lng !== nextLoc.lng) {
          locations.push(nextLoc);
        }
      }
    }
  }


  // 4. Calculate terrain distances (cumulative distances along the fetched terrain path)
  let currentTerrainDistances: number[] = [];
  if (terrainData.length > 0) {
    currentTerrainDistances.push(0);
    for (let i = 0; i < terrainData.length - 1; i++) {
      const distance = haversineDistance(terrainData[i].loc, terrainData[i + 1].loc);
      currentTerrainDistances.push(currentTerrainDistances[i] + distance);
    }
  } else {
    currentTerrainDistances.push(0); // Default if no terrain data
  }

  // 5. Calculate minimum terrain height
  let minOverallTerrainHeight = terrainData[0]?.elevation ?? 0;
  for (let i = 1; i < terrainData.length; i++) {
    minOverallTerrainHeight = Math.min(terrainData[i].elevation, minOverallTerrainHeight);
  }

  // 6. Prepare terrain profile for the chart (normalized elevation)
  const terrainProfileForChart = terrainData.map((td, index) => ({
    distance: parseFloat(currentTerrainDistances[index]?.toFixed(1) || "0"),
    elevation: td.elevation - (terrainData[0]?.elevation ?? 0), // Normalize to first terrain point
  }));

  // 7. Prepare command positions for the chart
  const commandPositionsForChart = wpsLocs.map(({ alt, lat, lng }, index) => {
    return {
      id: index, // Use index for selection, consistent with handleCommandClick
      distance: waypointCumulativeDistances[index],
      altitude: alt,
      alt: alt,
      lat,
      lng,
      selected: selectedWPs.includes(index),
    };
  });

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

  const handleCommandClick = (e: React.MouseEvent<SVGElement>, id: number) => {
    setSelectedWPs((prev) => {
      return [id]
    });
  };

  return (
    <div className="w-full p-2">
      <div className="flex flex-row gap-2">
        <label>
          <span className="block">Altitude</span>
          {/* @ts-ignore */}
          <DraggableNumberInput name="altitude" onChange={onChange} value={vals} />
        </label>
        <label>
          <span className="block">Frame</span>
          <select className="w-40 h-[25px] border-input bg-card">
            <option >Relative</option>
            <option >AMSL</option>
          </select>
        </label>
      </div>
      <TerrainChart
        commandPositions={commandPositionsForChart}
        terrainProfile={terrainProfileForChart}
        onCommandClick={handleCommandClick} // Pass the handler
      />
    </div>
  );
}
