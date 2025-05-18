import { Event } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL,TOKEN_LOCAL_STORAGE } from '../utils/constants';

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
    updateEvent: (eventId: number, eventData: Partial<Event>) => Promise<Event>;
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
            const res = await fetch(BASE_URL + '/v1/event',{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const data: Event[] = await res.json();
            set({ events: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Laden der Events',
                isLoading: false,
            });
        }
    },

    createEvent: async (eventData: EventCreateInput) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify(eventData)
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const newEvent: Event = await res.json();
            
            // Füge das neue Event zur Liste hinzu
            const currentEvents = get().events;
            set({ events: [...currentEvents, newEvent], isLoading: false });
            
            return newEvent;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Erstellen des Events',
                isLoading: false,
            });
            throw error;
        }
    },

    updateEvent: async (eventId: number, eventData: Partial<Event>) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/event/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify(eventData)
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const updatedEvent: Event = await res.json();
            
            // Aktualisiere das Event in der Liste
            const currentEvents = get().events;
            const updatedEvents = currentEvents.map(event => 
                event.id === eventId ? updatedEvent : event
            );
            
            set({ events: updatedEvents, isLoading: false });
            return updatedEvent;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Aktualisieren des Events',
                isLoading: false,
            });
            throw error;
        }
    },

    setEvents: (events: Event[]) => set({ events }),
    clearEvents: () => set({ events: [] }),
}));