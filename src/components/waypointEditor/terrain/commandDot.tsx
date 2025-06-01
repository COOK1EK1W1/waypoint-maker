import { ScatterProps } from "recharts";

export default function CommandDot({ cx, cy, stroke, payload, fill, yAxis, onCmdClick }: ScatterProps & { payload: any, onCmdClick: (e: React.MouseEvent<SVGElement>, id: number) => void }) {

  if (payload.commandHeight === undefined || yAxis === undefined || yAxis.y === undefined || yAxis.height === undefined) return null

  const markerRadius = 6; // Increased size for clickability
  const yAxisBottom = Number(yAxis.y) + yAxis.height; // Bottom of the Y-axis plot area
  const isSelected = payload.selected; // Get selected status

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    console.log(payload)
    if (onCmdClick && payload.id !== undefined) {
      onCmdClick(e, payload.id);
    }
  };

  return (
    <g onMouseDown={(e) => handleClick(e)} style={{ cursor: 'pointer' }}> {/* Add onClick and cursor style */}
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

