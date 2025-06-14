import { create } from 'zustand';
import { apiClient } from '../utils/api';

interface Invitation {
    id: number;
    invite_uuid: string;
    email: string;
    expire_date: string;
    created_at: string;
    is_used: boolean;
}

interface InvitationCreate {
    email: string;
    expire_days?: number;
}

interface InvitationStore {
    invitations: Invitation[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
    fetchInvitations: (skip?: number, limit?: number) => Promise<void>;
    createInvitation: (data: InvitationCreate) => Promise<boolean>;
    deleteInvitation: (inviteUuid: string) => Promise<boolean>;
    setInvitations: (invitations: Invitation[]) => void;
    clearInvitations: () => void;
}

export const useInvitationStore = create<InvitationStore>((set, get) => ({
    invitations: [],
    totalCount: 0,
    isLoading: false,
    error: null,

    fetchInvitations: async (skip = 0, limit = 100) => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiClient.get('/v1/invite', {
                params: { skip, limit },
            });

            set({
                invitations: response.data.invites,
                totalCount: response.data.count,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Fehler beim Laden der Einladungen',
                isLoading: false,
            });
        }
    },

    createInvitation: async (data: InvitationCreate) => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiClient.post('/v1/invite', data);
            
            // Neue Einladung zur Liste hinzufügen
            const newInvitation = response.data;
            const currentInvitations = get().invitations;
            
            set({
                invitations: [newInvitation, ...currentInvitations],
                totalCount: get().totalCount + 1,
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Fehler beim Erstellen der Einladung',
                isLoading: false,
            });
            return false;
        }
    },

    deleteInvitation: async (inviteUuid: string) => {
        set({ isLoading: true, error: null });

        try {
            await apiClient.delete(`/v1/invite/${inviteUuid}`);
            
            // Einladung aus der Liste entfernen
            const currentInvitations = get().invitations;
            const filteredInvitations = currentInvitations.filter(
                (invitation) => invitation.invite_uuid !== inviteUuid
            );
            
            set({
                invitations: filteredInvitations,
                totalCount: get().totalCount - 1,
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || error.message || 'Fehler beim Löschen der Einladung',
                isLoading: false,
            });
            return false;
        }
    },

    setInvitations: (invitations: Invitation[]) => {
        set({ invitations });
    },

    clearInvitations: () => {
        set({ invitations: [], totalCount: 0, error: null });
    },
})); 