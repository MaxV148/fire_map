import { Tag } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL } from '../utils/constants';

interface TagStore {
    tags: Tag[];
    isLoading: boolean;
    error: string | null;
    fetchTags: () => Promise<void>;
    createTag: (tagData: { name: string; color: string }) => Promise<Tag>;
    updateTag: (tagId: number, tagData: { name?: string; color?: string }) => Promise<Tag>;
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
            const response = await fetch(`${BASE_URL}/v1/tag`, {
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Tags');
            }

            const tags: Tag[] = await response.json();
            set({ tags, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createTag: async (tagData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/tag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(tagData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Tags');
            }

            const newTag: Tag = await response.json();
            set(state => ({
                tags: [...state.tags, newTag],
                isLoading: false
            }));

            return newTag;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateTag: async (tagId, tagData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/tag/${tagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(tagData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Tags');
            }

            const updatedTag: Tag = await response.json();
            
            set(state => ({
                tags: state.tags.map(tag => 
                    tag.id === tagId ? updatedTag : tag
                ),
                isLoading: false
            }));

            return updatedTag;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteTag: async (tagId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/tag/${tagId}`, {
                method: 'DELETE',
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Tags');
            }

            set(state => ({
                tags: state.tags.filter(tag => tag.id !== tagId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setTags: (tags) => set({ tags }),
    clearTags: () => set({ tags: [] }),
}));
