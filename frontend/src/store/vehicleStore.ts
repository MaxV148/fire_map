import { VehicleType } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';

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

export const useVehicleStore = create<VehicleStore>((set) => ({
    vehicles: [],
    isLoading: false,
    error: null,

    fetchVehicles: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/v1/vehicle');
            const vehicles: VehicleType[] = response.data;
            set({ vehicles, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Fahrzeugtypen', isLoading: false });
        }
    },

    createVehicle: async (vehicleData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/vehicle', vehicleData);
            const newVehicle: VehicleType = response.data;
            
            set(state => ({
                vehicles: [...state.vehicles, newVehicle],
                isLoading: false
            }));

            return newVehicle;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Erstellen des Fahrzeugtyps', isLoading: false });
            throw error;
        }
    },

    updateVehicle: async (vehicleId, vehicleData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put(`/v1/vehicle/${vehicleId}`, vehicleData);
            const updatedVehicle: VehicleType = response.data;
            
            set(state => ({
                vehicles: state.vehicles.map(vehicle => 
                    vehicle.id === vehicleId ? updatedVehicle : vehicle
                ),
                isLoading: false
            }));

            return updatedVehicle;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Aktualisieren des Fahrzeugtyps', isLoading: false });
            throw error;
        }
    },

    deleteVehicle: async (vehicleId) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/v1/vehicle/${vehicleId}`);

            set(state => ({
                vehicles: state.vehicles.filter(vehicle => vehicle.id !== vehicleId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Fahrzeugtyps', isLoading: false });
            throw error;
        }
    },

    setVehicles: (vehicles) => set({ vehicles }),
    clearVehicles: () => set({ vehicles: [] }),
}));
