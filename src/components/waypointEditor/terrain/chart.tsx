import { haversineDistance } from "@/lib/world/distance";
import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Scatter,
  ResponsiveContainer,
  Area,
  LabelList,
} from "recharts";
import CommandDot from "./commandDot";
import { LatLngAlt } from "@/lib/world/latlng";

// Extend LatLngAlt to include originalIndex for our specific use case in the chart
interface CommandPositionForChart extends LatLngAlt {
  id: number;
  selected: boolean;
}

// Custom Tooltip Content
const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const commandEntry = payload.find(
      (pld: any) => pld.dataKey === 'commandHeight' && pld.value !== undefined && pld.value !== null
    );

    if (commandEntry) {
      return (
        <div className="rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          <p>{`Cmd Height: ${Number(commandEntry.value).toFixed(1)} m`}</p>
        </div>
      );
    }
  }
  return null;
};

export default function TerrainChart({ commandPositions, terrainProfile, onCommandClick, waypointGradients }: {
  commandPositions: CommandPositionForChart[];
  terrainProfile: Array<{ distance: number; elevation: number }>;
  onCommandClick: (e: React.MouseEvent<SVGElement>, originalIndex: number) => void; // Add the onClick handler prop
  waypointGradients?: number[]; // Add waypointGradients prop
}) {

  // check if there is enough data to display the chart
  if (commandPositions.length < 1 && terrainProfile.length === 0) { // Changed to < 1 for commandPositions
    return (
      <div className="h-[180px] flex w-full items-center justify-center">
        Not enough data for chart.
      </div>
    );
  }

  // 1. Process commandPositions to get points with distances
  const commandPointsWithDistance: Array<{
    distance: number;
    commandHeight: number;
    lat: number;
    lng: number;
    id: number;
    selected: boolean; // Add selected status here
    gradient?: number; // Add gradient property
  }> = [];
  let cumulativeCmdDistance = 0;
  commandPositions.forEach((pos, index) => { // Add index for accessing gradient
    if (commandPointsWithDistance.length > 0) { // Check based on array instead of index
      const prevPos = commandPositions[commandPointsWithDistance.length - 1]; // Get actual previous position
      cumulativeCmdDistance += haversineDistance({ lat: prevPos.lat, lng: prevPos.lng }, { lat: pos.lat, lng: pos.lng });
    }
    commandPointsWithDistance.push({
      distance: parseFloat(cumulativeCmdDistance.toFixed(1)),
      commandHeight: pos.alt,
      lat: pos.lat,
      lng: pos.lng,
      id: pos.id,
      selected: pos.selected, // Pass selected status
      gradient: waypointGradients && waypointGradients[index + 1], // Assign gradient for the segment starting from this point
    });
  });

  // 2. Combine command points and terrain profile points
  const distanceMap = new Map<number, {
    commandHeight?: number;
    terrainElevation?: number;
    lat?: number;
    lng?: number;
    id?: number;
    selected?: boolean; // Add selected status here
    gradient?: number; // Add gradient to map
  }>();

  commandPointsWithDistance.forEach(cp => {
    const existing = distanceMap.get(cp.distance) || {};
    distanceMap.set(cp.distance, {
      ...existing,
      commandHeight: cp.commandHeight,
      lat: cp.lat,
      lng: cp.lng,
      id: cp.id,
      selected: cp.selected, // Pass selected status
      gradient: cp.gradient, // Pass gradient
    });
  });

  terrainProfile.forEach(tp => {
    const existing = distanceMap.get(tp.distance) || {};
    distanceMap.set(tp.distance, {
      ...existing,
      terrainElevation: tp.elevation,
    });
  });

  const chartData = Array.from(distanceMap.entries())
    .map(([distance, values]) => ({
      distance,
      ...values,
    }))
    .sort((a, b) => a.distance - b.distance);

  let minChartYValue = 0; // Default baseline if no data or all data is at/above 0
  const yValues = chartData
    .flatMap(d => [d.terrainElevation, d.commandHeight])
    .filter(v => typeof v === 'number') as number[];

  if (yValues.length > 0) {
    minChartYValue = Math.min(...yValues);
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="distance"
          type="number" // Ensure XAxis is treated as numerical
          domain={['dataMin', 'dataMax']} // Ensure full range is shown
          style={{ color: "--text-muted" }}
        />
        <YAxis
          label={{ value: "Elevation (m Rel)", angle: -90, position: "insideBottomLeft" }}
          domain={[minChartYValue, 'dataMax']} // Set Y-axis to start at minChartYValue and extend to dataMax
          style={{ color: "--text-muted" }}
        />
        <Tooltip content={<CustomTooltipContent />} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="terrainElevation"
          fill="#8884d8"
          stroke="#8884d8"
          fillOpacity={0.3}
          name="Terrain"
          connectNulls={true} // Connect lines even if there are nulls in between for terrain
          activeDot={false} // Disable dots on area line, as they might interfere with command dots
          baseValue={minChartYValue} // Fill to the calculated minimum Y value of the chart
        />
        <Line
          type="linear"
          isAnimationActive={false}
          dataKey="commandHeight"
          stroke="lime"
          strokeWidth={2}
          dot={false}
          name="Command Height"
          connectNulls={true}
        >
          {waypointGradients && (
            <LabelList
              dataKey="gradient" // Use the gradient data
              position="right" // Position label above the point
              formatter={(value: number) => value !== undefined && value !== 0 ? `${value.toFixed(1)}°` : ''} // Format as percentage
              style={{ fill: "black", fontSize: "10px" }} // Style the label
            // Offset the label to be between points
            // This requires knowing the next point's position or calculating midpoints
            // For simplicity, this example places it on the point; more complex positioning might be needed.
            />
          )}
        </Line>
        <Scatter
          dataKey="commandHeight"
          isAnimationActive={false}
          name="Command Height"
          fill="rgba(70, 151, 208, 1)"
          shape={
            // @ts-ignore
            <CommandDot onCmdClick={onCommandClick} />} // Pass onCommandClick to the shape
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
