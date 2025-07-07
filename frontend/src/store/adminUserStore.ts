import { User } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';

interface AdminUserStore {
    users: User[];
    isLoading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    deleteUser: (userId: number) => Promise<boolean>;
    updateUserRole: (userId: number, role_id: number) => Promise<boolean>;
}

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiClient.get('/v1/user/');
            const users: User[] = response.data;
            set({ users, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Benutzer', isLoading: false });
        }
    },

    deleteUser: async (userId: number) => {
        set({ isLoading: true, error: null });

        try {
            await apiClient.delete(`/v1/user/${userId}`);

            // Aktualisiere die Benutzerliste nach dem Löschen
            set({
                users: get().users.filter(user => user.id !== userId),
                isLoading: false
            });
            
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Unbekannter Fehler',
                isLoading: false,
            });
            return false;
        }
    },

    updateUserRole: async (userId: number, role_id: number) => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiClient.put(`/v1/user/${userId}/role`, { role_id: role_id });
            
            // Aktualisiere den Benutzer in der Liste
            const updatedUser: User = response.data;
            set(state => ({
                users: state.users.map(user => 
                    user.id === userId ? updatedUser : user
                ),
                isLoading: false
            }));
            
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Unbekannter Fehler',
                isLoading: false,
            });
            return false;
        }
    },
})); 