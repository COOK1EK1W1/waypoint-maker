"use client";
import { Plane, Vehicle } from '@/types/vehicleType';
import { vehicleTypeContext } from './VehicleTypeContext';
import { useState } from 'react';

type Props = {
  children: React.ReactNode;
};

const defaultVehicle: Plane = {
  type: "Plane",
  cruiseAirspeed: 17,
  maxBank: 30
}

export default function VehicleProvider({ children }: Props) {
  const [vehicle, setVehicle] = useState(defaultVehicle as Vehicle)
  return (
    <vehicleTypeContext.Provider value={{vehicle: vehicle, setVehicle: setVehicle}}>
      {children}
    </vehicleTypeContext.Provider>
  );
}
