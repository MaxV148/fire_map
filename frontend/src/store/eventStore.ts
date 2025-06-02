import { Event, EventUpdateInput } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL } from '../utils/constants';
import { useFilterStore } from './filterStore';
import dayjs from 'dayjs';

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

export const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    isLoading: false,
    error: null,

    fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
            const filters = useFilterStore.getState().filters;
            
            // Build query parameters
            const params = new URLSearchParams();
            
            if (filters.eventType && filters.eventType.length > 0) {
                params.append('vehicle_ids', filters.eventType.join(','));
            }
            
            if (filters.tags && filters.tags.length > 0) {
                params.append('tag_ids', filters.tags.join(','));
            }
            
            if (filters.startDate) {
                params.append('start_date', filters.startDate);
            }
            
            if (filters.endDate) {
                params.append('end_date', filters.endDate);
            }

            const queryString = params.toString();
            const url = `${BASE_URL}/v1/event${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Events');
            }

            const events: Event[] = await response.json();
            set({ events, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createEvent: async (eventData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Events');
            }

            const newEvent: Event = await response.json();
            set(state => ({
                events: [...state.events, newEvent],
                isLoading: false
            }));

            return newEvent;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateEvent: async (eventId, eventData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/event/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Events');
            }

            const updatedEvent: Event = await response.json();
            
            set(state => ({
                events: state.events.map(event => 
                    event.id === eventId ? updatedEvent : event
                ),
                isLoading: false
            }));

            return updatedEvent;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteEvent: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/event/${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Events');
            }

            set(state => ({
                events: state.events.filter(event => event.id !== eventId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setEvents: (events) => set({ events }),
    clearEvents: () => set({ events: [] }),
}));