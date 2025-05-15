"use client";
import { defaultPlane } from '@/lib/vehicles/defaults';
import { vehicleTypeContext } from './VehicleTypeContext';
import { useState } from 'react';
import { Vehicle } from '@/lib/vehicles/types';

type Props = {
  children: React.ReactNode;
  vehicle?: Vehicle
};

export default function VehicleProvider({ children, vehicle }: Props) {
  const [v, setVehicle] = useState(vehicle || defaultPlane as Vehicle)
  return (
    <vehicleTypeContext.Provider value={{ vehicle: v, setVehicle: setVehicle }}>
      {children}
    </vehicleTypeContext.Provider>
  );
}
