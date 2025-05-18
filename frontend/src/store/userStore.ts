import { User } from '../utils/types';
import { create } from 'zustand';
import { TOKEN_LOCAL_STORAGE, BASE_URL} from "../utils/constants.ts";


interface UserStore {
    user: User | null;
    token: string | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    rehydrate: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    fetchMe: (token: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    token: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            // Step 1: Login + Token holen
            const res = await fetch(BASE_URL + '/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Login fehlgeschlagen');

            const data: { access_token: string; token_type: string } = await res.json();
            const token = data.access_token;

            // Step 2: Userdaten via /me abrufen
            const meRes = await fetch(BASE_URL + '/v1/user/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!meRes.ok) throw new Error('Benutzerdaten konnten nicht geladen werden');

            const user: User = await meRes.json();

            // Zustand setzen
            set({
                user,
                token,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
                isLoading: false,
            });

            localStorage.setItem(TOKEN_LOCAL_STORAGE, token);
            return true;
        } catch (error: any) {
            set({
                error: error.message || 'Unbekannter Fehler',
                isLoading: false,
                user: null,
                token: null,
                isAuthenticated: false,
            });
            return false;
        }
    },

    logout: () => {
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
        localStorage.removeItem(TOKEN_LOCAL_STORAGE);
    },

    fetchMe: async (token) => {
        try {
            const res = await fetch(BASE_URL + '/v1/user/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Fehler beim Abrufen von /me');

            const user: User = await res.json();

            set({
                user,
                token,
                isAuthenticated: true,
            });
        } catch (err: any) {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                error: err.message || 'Fehler bei /me',
            });
            localStorage.removeItem(TOKEN_LOCAL_STORAGE);
        }
    },
    rehydrate: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        await useUserStore.getState().fetchMe(token);
    },
}));