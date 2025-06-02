import { VehicleType } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL } from '../utils/constants';

interface VehicleStore {
    vehicles: VehicleType[];
    isLoading: boolean;
    error: string | null;
    fetchVehicles: () => Promise<void>;
    createVehicle: (vehicleData: { name: string }) => Promise<VehicleType>;
    updateVehicle: (vehicleId: number, vehicleData: { name?: string }) => Promise<VehicleType>;
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
            const response = await fetch(`${BASE_URL}/v1/vehicle`, {
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Fahrzeugtypen');
            }

            const vehicles: VehicleType[] = await response.json();
            set({ vehicles, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createVehicle: async (vehicleData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/vehicle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(vehicleData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Fahrzeugtyps');
            }

            const newVehicle: VehicleType = await response.json();
            set(state => ({
                vehicles: [...state.vehicles, newVehicle],
                isLoading: false
            }));

            return newVehicle;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateVehicle: async (vehicleId, vehicleData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/vehicle/${vehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(vehicleData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Fahrzeugtyps');
            }

            const updatedVehicle: VehicleType = await response.json();
            
            set(state => ({
                vehicles: state.vehicles.map(vehicle => 
                    vehicle.id === vehicleId ? updatedVehicle : vehicle
                ),
                isLoading: false
            }));

            return updatedVehicle;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteVehicle: async (vehicleId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/vehicle/${vehicleId}`, {
                method: 'DELETE',
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Fahrzeugtyps');
            }

            set(state => ({
                vehicles: state.vehicles.filter(vehicle => vehicle.id !== vehicleId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setVehicles: (vehicles) => set({ vehicles }),
    clearVehicles: () => set({ vehicles: [] }),
}));
