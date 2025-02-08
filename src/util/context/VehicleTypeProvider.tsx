"use client";
import { Vehicle } from '@/types/vehicleType';
import { vehicleTypeContext } from './VehicleTypeContext';
import { useState } from 'react';
import { defaultPlane } from '../defaultVehicles';

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
