import { User } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';


interface UserStore {
    user: User | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    requiresMfa: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (firstName: string, lastName: string, email: string, password: string, inviteToken: string) => Promise<boolean>;
    logout: () => void;
    fetchMe: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    // 2FA Funktionen
    setup2FA: () => Promise<string | null>;
    verify2FA: (code: string) => Promise<boolean>;
    disable2FA: (code: string, confirm: boolean) => Promise<boolean>;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    isAdmin: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    requiresMfa: false,

    login: async (email, password) => {
        set({ isLoading: true, error: null, requiresMfa: false });

        try {
            // Session-basierter Login über /auth/login
            const loginRes = await apiClient.post('/v1/auth/login', { email, password });
            
            // Prüfe, ob 2FA erforderlich ist
            if (loginRes.data.requires_mfa) {
                set({
                    requiresMfa: true,
                    isLoading: false,
                });
                return true; // Login erfolgreich, aber 2FA erforderlich
            }

            // Normal Login ohne 2FA - Userdaten abrufen
            const meRes = await apiClient.get('/v1/user/me');
            const user: User = meRes.data;

            // Zustand setzen
            set({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
                isLoading: false,
                requiresMfa: false,
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || error.response?.data?.message || error.message || 'Unbekannter Fehler',
                isLoading: false,
                user: null,
                isAuthenticated: false,
                requiresMfa: false,
            });
            return false;
        }
    },

    register: async (firstName, lastName, email, password, inviteToken) => {
        set({ isLoading: true, error: null });

        try {
            // Registrierung über /auth/register mit Einladungstoken
            await apiClient.post('/v1/auth/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            }, {
                params: {
                    invite: inviteToken
                }
            });

            // Nach erfolgreicher Registrierung Userdaten via /me abrufen
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
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Registrierung fehlgeschlagen';
            set({
                error: errorMessage,
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
                requiresMfa: false,
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
                requiresMfa: false,
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
                    requiresMfa: false,
                });
            }
        } catch (error: any) {
            // Bei Fehlern Session als inaktiv behandeln
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                error: null,
                requiresMfa: false,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    // 2FA Setup - Lädt QR-Code als Blob URL
    setup2FA: async () => {
        // Fehler zurücksetzen, aber isLoading NICHT global setzen
        set({ error: null });

        try {
            const response = await apiClient.post('/v1/user/2fa/setup', {}, {
                responseType: 'blob'
            });
            
            // QR-Code Blob in eine URL umwandeln
            const blob = new Blob([response.data], { type: 'image/png' });
            const qrCodeUrl = URL.createObjectURL(blob);
            
            return qrCodeUrl;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || '2FA Setup fehlgeschlagen';
            set({
                error: errorMessage,
            });
            return null;
        }
    },

    // 2FA Code verifizieren (für Setup und Login)
    verify2FA: async (code: string) => {
        set({ isLoading: true, error: null });

        try {
            await apiClient.post('/v1/user/2fa/verify', { code });

            // Nach erfolgreicher Verifizierung Userdaten abrufen
            const meRes = await apiClient.get('/v1/user/me');
            const user: User = meRes.data;

            // Wenn es ein Login-Flow ist (requiresMfa = true), komplett einloggen
            if (get().requiresMfa) {
                set({
                    user,
                    isAuthenticated: true,
                    isAdmin: user.role === 'admin',
                    isLoading: false,
                    requiresMfa: false,
                });
            } else {
                // Setup-Flow: nur Userdaten aktualisieren
                set({
                    user,
                    isAuthenticated: true,
                    isAdmin: user.role === 'admin',
                    isLoading: false,
                });
            }

            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || '2FA Verifizierung fehlgeschlagen';
            set({
                error: errorMessage,
                isLoading: false,
            });
            return false;
        }
    },

    // 2FA deaktivieren
    disable2FA: async (code: string, confirm: boolean = true) => {
        set({ isLoading: true, error: null });

        try {
            await apiClient.post('/v1/user/2fa/disable', { 
                code, 
                confirm 
            });

            // Nach erfolgreicher Deaktivierung Userdaten aktualisieren
            await get().fetchMe();

            set({ isLoading: false });
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || '2FA Deaktivierung fehlgeschlagen';
            set({
                error: errorMessage,
                isLoading: false,
            });
            return false;
        }
    },
}));