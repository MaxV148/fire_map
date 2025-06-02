import { User } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL} from "../utils/constants.ts";


interface UserStore {
    user: User | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    rehydrate: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    fetchMe: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            // Session-basierter Login über /auth/login
            const res = await fetch(BASE_URL + '/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Wichtig für Cookies
            });

            if (!res.ok) throw new Error('Login fehlgeschlagen');

            // Nach erfolgreichem Login Userdaten via /me abrufen
            const meRes = await fetch(BASE_URL + '/v1/user/me', {
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!meRes.ok) throw new Error('Benutzerdaten konnten nicht geladen werden');

            const user: User = await meRes.json();

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
                error: error.message || 'Unbekannter Fehler',
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
            await fetch(BASE_URL + '/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            // Auch bei Fehlern den lokalen Zustand zurücksetzen
            console.error('Logout-Fehler:', error);
        } finally {
            // Lokalen Zustand zurücksetzen
            set({
                user: null,
                isAuthenticated: false,
                error: null,
            });
        }
    },

    fetchMe: async () => {
        try {
            const res = await fetch(BASE_URL + '/v1/user/me', {
                credentials: 'include', 
            });

            if (!res.ok) throw new Error('Fehler beim Abrufen von /me');

            const user: User = await res.json();

            set({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });
        } catch (err: any) {
            set({
                user: null,
                isAuthenticated: false,
                error: err.message || 'Fehler bei /me',
            });
        }
    },
    
    rehydrate: async () => {
        // Bei Session-basierter Auth prüfen wir den /me Endpoint
        // um zu testen ob eine Session noch gültig ist
        set({ isLoading: true });
        
        try {
            await useUserStore.getState().fetchMe();
            // Wenn fetchMe erfolgreich ist, ist die Session gültig
            // isAuthenticated wird bereits in fetchMe auf true gesetzt
        } catch (error) {
            // Wenn fetchMe fehlschlägt, ist die Session ungültig
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