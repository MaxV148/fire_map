import { User, UserRole } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL } from "../utils/constants.ts";

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
            const response = await fetch(`${BASE_URL}/v1/user/`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Benutzer');
            }

            const users: User[] = await response.json();
            set({ users, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    deleteUser: async (userId: number) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${BASE_URL}/v1/user/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Benutzers');
            }

            // Aktualisiere die Benutzerliste nach dem Löschen
            set({
                users: get().users.filter(user => user.id !== userId),
                isLoading: false
            });
            
            return true;
        } catch (error: any) {
            set({
                error: error.message || 'Unbekannter Fehler',
                isLoading: false,
            });
            return false;
        }
    },

    updateUserRole: async (userId: number, role_id: number) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${BASE_URL}/v1/user/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role_id: role_id }),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren der Benutzerrolle');
            }

            // Aktualisiere den Benutzer in der Liste
            const updatedUser: User = await response.json();
            set(state => ({
                users: state.users.map(user => 
                    user.id === userId ? updatedUser : user
                ),
                isLoading: false
            }));
            
            return true;
        } catch (error: any) {
            set({
                error: error.message || 'Unbekannter Fehler',
                isLoading: false,
            });
            return false;
        }
    },
})); 