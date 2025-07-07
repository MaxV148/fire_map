import { Event, EventUpdateInput } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';
import { useFilterStore } from './filterStore';


interface EventCreateInput {
    name: string;
    description: string;
    location: number[];
    tag_ids: number[];
    vehicle_ids: number[];
}

interface EventStore {
    events: Event[];
    isLoading: boolean;
    error: string | null;
    fetchEvents: () => Promise<void>;
    createEvent: (eventData: EventCreateInput) => Promise<Event>;
    updateEvent: (eventId: number, eventData: EventUpdateInput) => Promise<Event>;
    deleteEvent: (eventId: number) => Promise<void>;
    setEvents: (events: Event[]) => void;
    clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
    events: [],
    isLoading: false,
    error: null,

    fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
            const filters = useFilterStore.getState().filters;
            
            // Build query parameters
            const params = new URLSearchParams();
            
            if (filters.vehicles && filters.vehicles.length > 0) {
                params.append('vehicle_ids', filters.vehicles.join(','));
            }
            
            if (filters.tags && filters.tags.length > 0) {
                params.append('tag_ids', filters.tags.join(','));
            }
            
            if (filters.dateRange && filters.dateRange.length === 2) {
                params.append('start_date', filters.dateRange[0].format('YYYY-MM-DD'));
                params.append('end_date', filters.dateRange[1].format('YYYY-MM-DD'));
            }

            const queryString = params.toString();
            const url = `/v1/event${queryString ? `?${queryString}` : ''}`;

            const response = await apiClient.get(url);
            const events: Event[] = response.data;
            
            set({ events, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Events', isLoading: false });
        }
    },

    createEvent: async (eventData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/event', eventData);
            const newEvent: Event = response.data;
            
            set(state => ({
                events: [...state.events, newEvent],
                isLoading: false
            }));

            return newEvent;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Erstellen des Events', isLoading: false });
            throw error;
        }
    },

    updateEvent: async (eventId, eventData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put(`/v1/event/${eventId}`, eventData);
            const updatedEvent: Event = response.data;
            
            set(state => ({
                events: state.events.map(event => 
                    event.id === eventId ? updatedEvent : event
                ),
                isLoading: false
            }));

            return updatedEvent;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Aktualisieren des Events', isLoading: false });
            throw error;
        }
    },

    deleteEvent: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/v1/event/${eventId}`);

            set(state => ({
                events: state.events.filter(event => event.id !== eventId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Events', isLoading: false });
            throw error;
        }
    },

    setEvents: (events) => set({ events }),
    clearEvents: () => set({ events: [] }),
}));