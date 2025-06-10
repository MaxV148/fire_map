import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { BASE_URL} from "../utils/constants.ts";

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // wichtig für Cookies (Sessions)
});

// Globaler Navigator für die Verwendung außerhalb von Komponenten
let globalNavigate: NavigateFunction | null = null;

export const setGlobalNavigate = (navigate: NavigateFunction) => {
    globalNavigate = navigate;
};

// Callback für 401-Behandlung (wird vom userStore gesetzt)
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
    onUnauthorized = callback;
};

// Interceptor nur einmal registrieren
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            console.log("LOGOUT INTERCEPTOR")

            // Callback für Logout aufrufen (falls gesetzt)
            if (onUnauthorized) {
                onUnauthorized();
            }

            // Mit React Router navigieren (falls verfügbar)
            if (globalNavigate) {
                globalNavigate('/login');
            } else {
                // Fallback zu window.location falls navigate nicht verfügbar
                window.location.href = '/login';
            }

            // Rejection nicht vergessen
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

