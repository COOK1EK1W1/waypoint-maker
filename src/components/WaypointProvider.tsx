"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';

type Props = {
  children: React.ReactNode;
};

export default function WaypointProvider({ children }: Props) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  return (
    <waypointContext.Provider value={[waypoints, setWaypoints]}>
      {children}
    </waypointContext.Provider>
  );
}