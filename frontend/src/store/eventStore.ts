import { Event, EventUpdateInput, PaginatedEventResponse, PaginationParams } from '../utils/types';
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
    pagination: {
        total_count: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchEvents: (params?: Partial<PaginationParams>) => Promise<void>;
    createEvent: (eventData: EventCreateInput) => Promise<Event>;
    updateEvent: (eventId: number, eventData: EventUpdateInput) => Promise<Event>;
    deleteEvent: (eventId: number) => Promise<void>;
    setEvents: (events: Event[]) => void;
    clearEvents: () => void;
    goToPage: (page: number) => Promise<void>;
    nextPage: () => Promise<void>;
    previousPage: () => Promise<void>;
    setPageSize: (limit: number) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    pagination: {
        total_count: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
    },
    isLoading: false,
    error: null,

    fetchEvents: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const currentState = get();
            const filters = useFilterStore.getState().filters;
            
            // Merge current pagination with new params
            const paginationParams = {
                page: params?.page ?? currentState.pagination.page,
                limit: params?.limit ?? currentState.pagination.limit,
            };
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            // Add pagination parameters
            queryParams.append('page', paginationParams.page.toString());
            queryParams.append('limit', paginationParams.limit.toString());
            
            // Add filter parameters
            if (filters.vehicles && filters.vehicles.length > 0) {
                queryParams.append('vehicle_ids', filters.vehicles.join(','));
            }
            
            if (filters.tags && filters.tags.length > 0) {
                queryParams.append('tag_ids', filters.tags.join(','));
            }
            
            if (filters.dateRange && filters.dateRange.length === 2) {
                queryParams.append('start_date', filters.dateRange[0].format('YYYY-MM-DD'));
                queryParams.append('end_date', filters.dateRange[1].format('YYYY-MM-DD'));
            }
            
            
            // Standort-Filter hinzufügen
            if (filters.city && filters.distance !== undefined) {
                queryParams.append('city_name', filters.city);
                queryParams.append('distance_km', filters.distance.toString());
            }

            const url = `/v1/event?${queryParams.toString()}`;

            const response = await apiClient.get(url);
            const paginatedResponse: PaginatedEventResponse = response.data;
            
            set({ 
                events: paginatedResponse.events, 
                pagination: {
                    total_count: paginatedResponse.total_count,
                    page: paginatedResponse.page,
                    limit: paginatedResponse.limit,
                    total_pages: paginatedResponse.total_pages,
                },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Events', isLoading: false });
        }
    },

    createEvent: async (eventData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/event', eventData);
            const newEvent: Event = response.data;
            
            // Nach dem Erstellen die erste Seite neu laden, um korrekte Paginierung zu haben
            const { fetchEvents } = get();
            await fetchEvents({ page: 1 });

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

            // Nach dem Löschen die aktuelle Seite neu laden
            const { fetchEvents } = get();
            await fetchEvents();
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Events', isLoading: false });
            throw error;
        }
    },

    setEvents: (events) => set({ events }),
    clearEvents: () => set({ events: [], pagination: { total_count: 0, page: 1, limit: 10, total_pages: 0 } }),

    goToPage: async (page) => {
        const { fetchEvents } = get();
        await fetchEvents({ page });
    },

    nextPage: async () => {
        const { pagination, fetchEvents } = get();
        if (pagination.page < pagination.total_pages) {
            await fetchEvents({ page: pagination.page + 1 });
        }
    },

    previousPage: async () => {
        const { pagination, fetchEvents } = get();
        if (pagination.page > 1) {
            await fetchEvents({ page: pagination.page - 1 });
        }
    },

    setPageSize: async (limit) => {
        const { fetchEvents } = get();
        await fetchEvents({ page: 1, limit });
    },
}));