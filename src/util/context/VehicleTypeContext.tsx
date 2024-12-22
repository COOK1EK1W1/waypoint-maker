"use client";
import { Vehicle } from '@/types/vehicleType';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';

type provided = {
  vehicle: Vehicle,
  setVehicle: Dispatch<SetStateAction<Vehicle>>
}

export const vehicleTypeContext = createContext<provided>(undefined as any);

export function useVehicleTypeContext() {
  const context = useContext(vehicleTypeContext);

  if (context === undefined) {
    throw new Error('No vehicle context provided');
  }

  return context;
}
