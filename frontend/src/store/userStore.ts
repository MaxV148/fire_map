import { User } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';


interface UserStore {
    user: User | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    fetchMe: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            // Session-basierter Login über /auth/login
            await apiClient.post('/v1/auth/login', { email, password });

            // Nach erfolgreichem Login Userdaten via /me abrufen
            const meRes = await apiClient.get('/v1/user/me');
            const user: User = meRes.data;

            // Zustand setzen
            set({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Unbekannter Fehler',
                isLoading: false,
                user: null,
                isAuthenticated: false,
            });
            return false;
        }
    },

    logout: async () => {
        try {
            // Session serverseitig beenden
            await apiClient.post('/v1/auth/logout');
        } catch (error) {
            // Auch bei Fehlern den lokalen Zustand zurücksetzen
            console.error('Logout-Fehler:', error);
        } finally {
            // Lokalen Zustand zurücksetzen
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                error: null,
            });
        }
    },

    fetchMe: async () => {
        set({ isLoading: true });
        
        try {
            const res = await apiClient.get('/v1/user/me');
            const user: User = res.data;

            set({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });
        } catch (err: any) {
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                error: err.response?.data?.message || err.message || 'Fehler bei /me',
            });
        } finally {
            set({ isLoading: false });
        }
    },
    
    checkAuthStatus: async () => {
        set({ isLoading: true });
        
        try {
            const res = await apiClient.get('/v1/auth/status');
            const isActive = res.data.status === 'active';
            
            if (isActive) {
                // Session ist aktiv - lade Userdaten falls nicht vorhanden
                if (!get().user) {
                    await get().fetchMe();
                } else {
                    // Session ist aktiv und Userdaten sind bereits vorhanden
                    set({ isAuthenticated: true });
                }
            } else {
                // Session ist inaktiv
                set({
                    user: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    error: null,
                });
            }
        } catch (error: any) {
            // Bei Fehlern Session als inaktiv behandeln
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                error: null,
            });
        } finally {
            set({ isLoading: false });
        }
    },
}));