import { Tag } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';

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

export const useTagStore = create<TagStore>((set) => ({
    tags: [],
    isLoading: false,
    error: null,

    fetchTags: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/v1/tag');
            const tags: Tag[] = response.data;
            set({ tags, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Tags', isLoading: false });
        }
    },

    createTag: async (tagData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/tag', tagData);
            const newTag: Tag = response.data;
            
            set(state => ({
                tags: [...state.tags, newTag],
                isLoading: false
            }));

            return newTag;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Erstellen des Tags', isLoading: false });
            throw error;
        }
    },

    updateTag: async (tagId, tagData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put(`/v1/tag/${tagId}`, tagData);
            const updatedTag: Tag = response.data;
            
            set(state => ({
                tags: state.tags.map(tag => 
                    tag.id === tagId ? updatedTag : tag
                ),
                isLoading: false
            }));

            return updatedTag;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Aktualisieren des Tags', isLoading: false });
            throw error;
        }
    },

    deleteTag: async (tagId) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/v1/tag/${tagId}`);

            set(state => ({
                tags: state.tags.filter(tag => tag.id !== tagId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Tags', isLoading: false });
            throw error;
        }
    },

    setTags: (tags) => set({ tags }),
    clearTags: () => set({ tags: [] }),
}));
