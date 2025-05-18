import { VehicleType } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL, TOKEN_LOCAL_STORAGE } from '../utils/constants';

interface VehicleStore {
    vehicles: VehicleType[];
    isLoading: boolean;
    error: string | null;
    fetchVehicles: () => Promise<void>;
    createVehicle: (name: string) => Promise<VehicleType>;
    updateVehicle: (vehicleId: number, name: string) => Promise<VehicleType>;
    deleteVehicle: (vehicleId: number) => Promise<void>;
    setVehicles: (vehicles: VehicleType[]) => void;
    clearVehicles: () => void;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
    vehicles: [],
    isLoading: false,
    error: null,

    fetchVehicles: async () => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(BASE_URL + '/v1/vehicle', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const data: VehicleType[] = await res.json();
            set({ vehicles: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Laden der Fahrzeugtypen',
                isLoading: false,
            });
        }
    },

    createVehicle: async (name: string) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/vehicle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify({ name })
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const newVehicle: VehicleType = await res.json();
            
            // Füge den neuen Fahrzeugtyp zur Liste hinzu
            const currentVehicles = get().vehicles;
            set({ vehicles: [...currentVehicles, newVehicle], isLoading: false });
            
            return newVehicle;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Erstellen des Fahrzeugtyps',
                isLoading: false,
            });
            throw error;
        }
    },

    updateVehicle: async (vehicleId: number, name: string) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/vehicle/${vehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify({ name })
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const updatedVehicle: VehicleType = await res.json();
            
            // Aktualisiere den Fahrzeugtyp in der Liste
            const currentVehicles = get().vehicles;
            const updatedVehicles = currentVehicles.map(vehicle => 
                vehicle.id === vehicleId ? updatedVehicle : vehicle
            );
            
            set({ vehicles: updatedVehicles, isLoading: false });
            return updatedVehicle;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Aktualisieren des Fahrzeugtyps',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteVehicle: async (vehicleId: number) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/vehicle/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            // Entferne den Fahrzeugtyp aus der Liste
            const currentVehicles = get().vehicles;
            const updatedVehicles = currentVehicles.filter(vehicle => vehicle.id !== vehicleId);
            
            set({ vehicles: updatedVehicles, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Löschen des Fahrzeugtyps',
                isLoading: false,
            });
            throw error;
        }
    },

    setVehicles: (vehicles: VehicleType[]) => set({ vehicles }),
    clearVehicles: () => set({ vehicles: [] }),
}));
