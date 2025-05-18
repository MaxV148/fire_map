import { Tag } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL, TOKEN_LOCAL_STORAGE } from '../utils/constants';

interface TagStore {
    tags: Tag[];
    isLoading: boolean;
    error: string | null;
    fetchTags: () => Promise<void>;
    createTag: (name: string) => Promise<Tag>;
    updateTag: (tagId: number, name: string) => Promise<Tag>;
    deleteTag: (tagId: number) => Promise<void>;
    setTags: (tags: Tag[]) => void;
    clearTags: () => void;
}

export const useTagStore = create<TagStore>((set, get) => ({
    tags: [],
    isLoading: false,
    error: null,

    fetchTags: async () => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(BASE_URL + '/v1/tag', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const data: Tag[] = await res.json();
            set({ tags: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Laden der Tags',
                isLoading: false,
            });
        }
    },

    createTag: async (name: string) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/tag`, {
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

            const newTag: Tag = await res.json();
            
            // Füge den neuen Tag zur Liste hinzu
            const currentTags = get().tags;
            set({ tags: [...currentTags, newTag], isLoading: false });
            
            return newTag;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Erstellen des Tags',
                isLoading: false,
            });
            throw error;
        }
    },

    updateTag: async (tagId: number, name: string) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/tag/${tagId}`, {
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

            const updatedTag: Tag = await res.json();
            
            // Aktualisiere den Tag in der Liste
            const currentTags = get().tags;
            const updatedTags = currentTags.map(tag => 
                tag.id === tagId ? updatedTag : tag
            );
            
            set({ tags: updatedTags, isLoading: false });
            return updatedTag;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Aktualisieren des Tags',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteTag: async (tagId: number) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/tag/${tagId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            // Entferne den Tag aus der Liste
            const currentTags = get().tags;
            const updatedTags = currentTags.filter(tag => tag.id !== tagId);
            
            set({ tags: updatedTags, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Löschen des Tags',
                isLoading: false,
            });
            throw error;
        }
    },

    setTags: (tags: Tag[]) => set({ tags }),
    clearTags: () => set({ tags: [] }),
}));
