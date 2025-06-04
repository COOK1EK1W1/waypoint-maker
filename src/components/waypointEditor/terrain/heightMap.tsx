import { useWaypoints } from "@/util/context/WaypointContext";
import { useThrottle } from "@uidotdev/usehooks";
import { ChangeEvent, useEffect, useState } from "react";
import { gradient, haversineDistance } from "@/lib/world/distance";
import { filterLatLngAltCmds } from "@/lib/commands/commands";
import { getLatLng, getLatLngAlt, LatLng, LatLngAlt } from "@/lib/world/latlng";
import DraggableNumberInput from "@/components/ui/draggableNumericInput";
import TerrainChart from "./chart";
import { getTerrain } from "@/lib/world/terrain";

function interpolate(a: LatLng, b: LatLng, c: number) {
  return { lat: a.lat * (1 - c) + b.lat * c, lng: a.lng * (1 - c) + b.lng * c }
}

// Helper function to get terrain elevation at a specific point
function getTerrainElevationAtPoint(terrainData: LatLngAlt[], point: LatLng): number {
  if (!terrainData.length) return 0;

  // Find the closest terrain point
  let closestPoint = terrainData[0];
  let minDistance = haversineDistance(point, terrainData[0]);

  for (const terrainPoint of terrainData) {
    const distance = haversineDistance(point, terrainPoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = terrainPoint;
    }
  }

  return closestPoint.alt;
}

export default function HeightMap() {
  const { activeMission, waypoints, setWaypoints, setSelectedWPs, selectedWPs } = useWaypoints();
  const [terrainData, setTerrainData] = useState<LatLngAlt[]>([]);
  const throttledValue = useThrottle(waypoints, 500);

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
        setTerrainData(data);
      }
    });
  }, [throttledValue]);

  if (wps.length < 2) {
    return (
      <div className="h-[150px] flex w-full items-center justify-center">Place two or more waypoints for height map</div>
    );
  }

  // calculate total distances
  const waypointCumulativeDistances: number[] = [0];
  const segmentSizes: number[] = []
  let totalDistance = 0;
  for (let i = 0; i < wpsLocs.length - 1; i++) {

    const loc = wpsLocs[i]
    const loc2 = wpsLocs[i + 1]
    const segmentDistance = haversineDistance(loc, loc2);

    segmentSizes.push(segmentDistance)

    totalDistance += segmentDistance;
    waypointCumulativeDistances.push(totalDistance);
  }

  // Populate the component-scoped 'locations' array for the getTerrain useEffect hook
  locations.length = 0; // Clear array before repopulating

  if (wps.length > 0) { // Should be wps.length >= 2 here
    locations.push(wpsLocs[0]);
    const interpolatedStepSize = totalDistance > 0 ? totalDistance / 100 : 0;

    if (interpolatedStepSize > 0) {
      for (let i = 0; i < wps.length - 1; i++) { // Iterate through segments
        const p1 = wpsLocs[i]
        const p2 = wpsLocs[i + 1]
        const curSegment = segmentSizes[i]

        if (curSegment > 0) {
          // Calculate number of interpolation points strictly between p1 and p2
          const numInterpolationIntervals = Math.floor(curSegment / interpolatedStepSize);
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
        const nextLoc = wpsLocs[i]
        if (locations.length === 0 || locations[locations.length - 1].lat !== nextLoc.lat || locations[locations.length - 1].lng !== nextLoc.lng) {
          locations.push(nextLoc);
        }
      }
    }
  }


  // Calculate terrain distances (cumulative distances along the fetched terrain path)
  let currentTerrainDistances: number[] = [];
  if (terrainData.length > 0) {
    currentTerrainDistances.push(0);
    for (let i = 0; i < terrainData.length - 1; i++) {
      const distance = haversineDistance(terrainData[i], terrainData[i + 1]);
      currentTerrainDistances.push(currentTerrainDistances[i] + distance);
    }
  } else {
    currentTerrainDistances.push(0); // Default if no terrain data
  }

  // Calculate minimum terrain height
  let minOverallTerrainHeight = terrainData[0]?.alt ?? 0;
  for (let i = 1; i < terrainData.length; i++) {
    minOverallTerrainHeight = Math.min(terrainData[i].alt, minOverallTerrainHeight);
  }

  // Prepare terrain profile for the chart (normalized elevation)
  const terrainProfileForChart = terrainData.map((td, index) => ({
    distance: parseFloat(currentTerrainDistances[index]?.toFixed(1) || "0"),
    elevation: td.alt - (terrainData[0]?.alt ?? 0)
  }));

  // Prepare command positions for the chart
  const commandPositionsForChart = wpsLocs.map(({ alt, lat, lng }, index) => {
    const wp = wps[index];
    let adjustedAltitude = alt;

    // Adjust altitude based on frame for display
    switch (wp.frame) {
      case 0: //AMSL (adjust to relative for graph)
        adjustedAltitude += -terrainData[0].alt
        break;
      case 3: // Relative to first command
        break;
      case 10: // Relative to terrain
        adjustedAltitude += getTerrainElevationAtPoint(terrainData, { lat, lng }) - terrainData[0].alt;
        break;
    }

    return {
      id: index,
      distance: waypointCumulativeDistances[index],
      alt: adjustedAltitude,
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

  // for parameters, check which are the same
  const frameValues = filterLatLngAltCmds(selected).map(obj => obj.frame);
  const frameAllSame = frameValues.every(val => val === frameValues[0]);
  const frameVal = frameAllSame ? frameValues[0] : null

  const altValues = filterLatLngAltCmds(selected).map(obj => obj.params["altitude"]);
  const altAllSame = altValues.every(val => val === altValues[0]);
  const altVal = altAllSame ? altValues[0] : null


  // update in change if altitude
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

  // change the reference frame of all selected commands
  function changeFrame(e: ChangeEvent<HTMLSelectElement>) {
    if (![0, 3, 10].includes(Number(e.target.value))) return
    const val = Number(e.target.value) as 0 | 3 | 10

    setWaypoints((prevMission) => {
      const temp = prevMission.clone()
      mission.forEach((_, i) => {
        if (selectedWPs.length === 0 || selectedWPs.includes(i)) {
          temp.changeParam(selectedWPs[i], activeMission, (x) => {
            let b = { ...x }
            if ("altitude" in x.params) {
              b.frame = val
            }
            return b
          })
        }
      })
      return temp
    })
  }

  return (
    <div className="w-full p-2">
      <div className="flex flex-row gap-2">
        <label>
          <span className="block">Altitude</span>
          {/* @ts-ignore */}
          <DraggableNumberInput name="altitude" onChange={onChange} value={altVal} />
        </label>
        <label>
          <span className="block">Frame</span>
          <select value={frameAllSame ? "" + frameVal : ""} onChange={changeFrame} className="w-40 h-[25px] border-input bg-card">
            {!frameAllSame ? <option value="" disabled>--</option> : null}
            <option value="3">Relative</option>
            <option value="0">AMSL</option>
            <option value="10">Terrain</option>
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
