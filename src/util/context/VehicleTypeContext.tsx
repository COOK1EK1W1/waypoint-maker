"use client";
import { Vehicle } from '@/lib/vehicles/types';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';

type provided = {
  vehicle: Vehicle,
  setVehicle: Dispatch<SetStateAction<Vehicle>>
}

export const vehicleTypeContext = createContext<provided>(undefined as any);

export function useVehicle() {
  const context = useContext(vehicleTypeContext);

  if (context === undefined) {
    throw new Error('No vehicle context provided');
  }

  return context;
}
