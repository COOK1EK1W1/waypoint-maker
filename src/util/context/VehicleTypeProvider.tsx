"use client";
import { defaultPlane } from '@/lib/vehicles/defaults';
import { vehicleTypeContext } from './VehicleTypeContext';
import { useState } from 'react';
import { Vehicle } from '@/lib/vehicles/types';

type Props = {
  children: React.ReactNode;
};

export default function VehicleProvider({ children }: Props) {
  const [vehicle, setVehicle] = useState(defaultPlane as Vehicle)
  return (
    <vehicleTypeContext.Provider value={{ vehicle: vehicle, setVehicle: setVehicle }}>
      {children}
    </vehicleTypeContext.Provider>
  );
}
