import { haversineDistance } from "@/lib/world/distance";
import { LatLngAlt } from "@/lib/world/types"; // Assuming LatLngAlt includes lat, lng, alt
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
} from "recharts";

// Extend LatLngAlt to include originalIndex for our specific use case in the chart
interface CommandPositionForChart extends LatLngAlt {
  originalIndex: number;
  selected: boolean;
}

interface TerrainChartProps {
  commandPositions: CommandPositionForChart[];
  terrainProfile: Array<{ distance: number; elevation: number }>;
  onCommandClick?: (originalIndex: number) => void; // Add the onClick handler prop
}

// Custom Tooltip Content
const CustomTooltipContent = ({ active, payload, label }: any) => {
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

// Custom Scatter Dot for Commands
const CustomCommandDot = (props: any) => {
  const { cx, cy, stroke, payload, fill, yAxis, onCommandClick } = props;

  // Don't render if commandHeight is not present or coordinates are invalid
  if (payload.commandHeight === undefined || payload.commandHeight === null || isNaN(cx) || isNaN(cy)) {
    return null;
  }

  const markerRadius = 6; // Increased size for clickability
  const yAxisBottom = yAxis.y + yAxis.height; // Bottom of the Y-axis plot area
  const isSelected = payload.selected; // Get selected status

  const handleClick = () => {
    if (onCommandClick && payload.originalIndex !== undefined) {
      onCommandClick(payload.originalIndex);
    }
  };

  return (
    <g onClick={handleClick} style={{ cursor: onCommandClick ? 'pointer' : 'default' }}> {/* Add onClick and cursor style */}
      {/* Vertical Line from point to X-axis */}
      <line 
        x1={cx} 
        y1={cy} 
        x2={cx} 
        y2={yAxisBottom} 
        stroke={fill} // Use the fill color for the line for consistency
        strokeWidth="1" 
        strokeDasharray="3 3" // Dashed line style
      />
      {/* Command Marker Circle */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={markerRadius} 
        stroke={stroke || fill} 
        strokeWidth="1.5" 
        fill={fill} 
      />
      {/* Pulsing border for selected commands */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={markerRadius} // Start at the marker radius
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        >
          <animate 
            attributeName="r" 
            from={markerRadius.toString()} 
            to={(markerRadius * 2.5).toString()} 
            dur="1.5s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="stroke-opacity" 
            from="1" 
            to="0" 
            dur="1.5s" 
            repeatCount="indefinite" 
          />
        </circle>
      )}
    </g>
  );
};

export default function TerrainChart({ commandPositions, terrainProfile, onCommandClick }: TerrainChartProps){

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
    originalIndex: number; 
    selected: boolean; // Add selected status here
  }> = [];
  let cumulativeCmdDistance = 0;
  commandPositions.forEach((pos) => { // Removed unused index parameter
    if (commandPointsWithDistance.length > 0) { // Check based on array instead of index
      const prevPos = commandPositions[commandPointsWithDistance.length - 1]; // Get actual previous position
      cumulativeCmdDistance += haversineDistance({lat: prevPos.lat, lng: prevPos.lng}, { lat: pos.lat, lng: pos.lng });
    }
    commandPointsWithDistance.push({
      distance: parseFloat(cumulativeCmdDistance.toFixed(1)),
      commandHeight: pos.alt,
      lat: pos.lat,
      lng: pos.lng,
      originalIndex: pos.originalIndex,
      selected: pos.selected, // Pass selected status
    });
  });

  // 2. Combine command points and terrain profile points
  const distanceMap = new Map<number, { 
    commandHeight?: number; 
    terrainElevation?: number; 
    lat?: number; 
    lng?: number; 
    originalIndex?: number; 
    selected?: boolean; // Add selected status here
  }>();

  commandPointsWithDistance.forEach(cp => {
    const existing = distanceMap.get(cp.distance) || {};
    distanceMap.set(cp.distance, {
      ...existing,
      commandHeight: cp.commandHeight,
      lat: cp.lat,
      lng: cp.lng,
      originalIndex: cp.originalIndex,
      selected: cp.selected, // Pass selected status
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
      <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="distance"
          type="number" // Ensure XAxis is treated as numerical
          domain={['dataMin', 'dataMax']} // Ensure full range is shown
          label={{ value: "Distance (m)", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          label={{ value: "Elevation (m)", angle: -90, position: "insideLeft" }}
          domain={[minChartYValue, 'dataMax']} // Set Y-axis to start at minChartYValue and extend to dataMax
        />
        <Tooltip content={<CustomTooltipContent />} />
        <Area
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
          dataKey="commandHeight"
          stroke="lime"
          strokeWidth={2}
          dot={false}
          name="Command Height"
          connectNulls={true}
        />
        <Scatter
          dataKey="commandHeight"
          name="Command Height"
          fill="rgba(70, 151, 208, 1)"
          shape={<CustomCommandDot onCommandClick={onCommandClick} />} // Pass onCommandClick to the shape
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};