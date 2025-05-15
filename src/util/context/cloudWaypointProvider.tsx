"use client";
import { startTransition, useEffect, useState } from 'react';
import { syncStatusKeys, waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { Mission, Node } from "@/lib/mission/mission";
import { syncMission } from '@/components/modal/IO/syncAction';
import { exportwpm2 } from '@/lib/missionIO/wm2/spec';
import { useVehicle } from './VehicleTypeContext';

type Props = {
  children: React.ReactNode;
  mission: Map<string, Node[]>;
  missionId: string,
  ownerId: string,
  userId: string | undefined
};

export default function CloudWaypointProvider({ children, mission, missionId, ownerId, userId }: Props) {

  const [waypoints, setWaypoints] = useState<Mission>(new Mission(mission))

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")

  const [syncStatus, setSyncStatus] = useState<typeof syncStatusKeys[number]>("synced")

  const [timeout, sett] = useState<Timer | undefined>()
  const { vehicle } = useVehicle()

  useEffect(() => {
    setSyncStatus("notSynced")
    if (process.env.NEXT_PUBLIC_AUTOSYNC && userId === ownerId) {
      clearTimeout(timeout)
      sett(setTimeout(() => {
        startTransition(() => {
          setSyncStatus("syncing")
          syncMission(missionId, exportwpm2(waypoints, vehicle)).then((x) => {
            if (x.error !== null) {
              alert(`There was an error syncing: ${x.error}`)
              setSyncStatus("error")
            } else {
              setSyncStatus("synced")
            }
          })
        })
      }, 10000))
    }
  }, [waypoints])


  return (
    <waypointContext.Provider value={{
      waypoints,
      setWaypoints,
      activeMission,
      setActiveMission,
      selectedWPs,
      setSelectedWPs,
      tool,
      setTool,
      missionId,
      ownerId,
      syncStatus,
      setSyncStatus
    }} >
      {children}
    </ waypointContext.Provider>
  );
}
