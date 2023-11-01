"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';

type Props = {
  children: React.ReactNode;
};

export default function WaypointProvider({ children }: Props) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [active, setActive] = useState<number|null>(null);
  return (
    <waypointContext.Provider value={{waypoints, setWaypoints, active, setActive}}>
      {children}
    </waypointContext.Provider>
  );
}