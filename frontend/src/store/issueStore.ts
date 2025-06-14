import { Issue, Tag } from '../utils/types';
import { create } from 'zustand';
import { apiClient } from '../utils/api';

interface IssueUpdateInput {
    name?: string;
    description?: string;
    location?: [number, number];
    tag_ids?: number[];
    status?: string;
    severity?: string;
}

interface IssueStore {
    issues: Issue[];
    isLoading: boolean;
    error: string | null;
    fetchIssues: () => Promise<void>;
    createIssue: (issueData: {
        name: string;
        description: string;
        location: [number, number];
        tag_ids: number[];
        status: string;
        severity: string;
    }) => Promise<Issue>;
    updateIssue: (issueId: number, issueData: IssueUpdateInput) => Promise<Issue>;
    deleteIssue: (issueId: number) => Promise<void>;
    setIssues: (issues: Issue[]) => void;
    clearIssues: () => void;
}

export const useIssueStore = create<IssueStore>((set, get) => ({
    issues: [],
    isLoading: false,
    error: null,

    fetchIssues: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/v1/issue');
            const issues: Issue[] = response.data;
            set({ issues, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Issues', isLoading: false });
        }
    },

    createIssue: async (issueData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/issue', issueData);
            const newIssue: Issue = response.data;
            
            set(state => ({
                issues: [...state.issues, newIssue],
                isLoading: false
            }));

            return newIssue;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Erstellen des Issues', isLoading: false });
            throw error;
        }
    },

    updateIssue: async (issueId, issueData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.put(`/v1/issue/${issueId}`, issueData);
            const updatedIssue: Issue = response.data;
            
            set(state => ({
                issues: state.issues.map(issue => 
                    issue.id === issueId ? updatedIssue : issue
                ),
                isLoading: false
            }));

            return updatedIssue;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Aktualisieren des Issues', isLoading: false });
            throw error;
        }
    },

    deleteIssue: async (issueId) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/v1/issue/${issueId}`);

            set(state => ({
                issues: state.issues.filter(issue => issue.id !== issueId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Issues', isLoading: false });
            throw error;
        }
    },

    setIssues: (issues) => set({ issues }),
    clearIssues: () => set({ issues: [] }),
}));
