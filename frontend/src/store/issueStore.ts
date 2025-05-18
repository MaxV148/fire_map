import { Issue, Tag } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL, TOKEN_LOCAL_STORAGE } from '../utils/constants';

interface IssueUpdateInput {
    name?: string;
    description?: string;
    location?: number[];
    tag_ids?: number[];
}

interface IssueStore {
    issues: Issue[];
    isLoading: boolean;
    error: string | null;
    fetchIssues: () => Promise<void>;
    createIssue: (issueData: { name: string; description: string; location: number[]; tag_ids: number[] }) => Promise<Issue>;
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
            const res = await fetch(BASE_URL + '/v1/issue', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const data: Issue[] = await res.json();
            set({ issues: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Laden der Issues',
                isLoading: false,
            });
        }
    },

    createIssue: async (issueData) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify(issueData)
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const newIssue: Issue = await res.json();
            
            // Füge das neue Issue zur Liste hinzu
            const currentIssues = get().issues;
            set({ issues: [...currentIssues, newIssue], isLoading: false });
            
            return newIssue;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Erstellen des Issues',
                isLoading: false,
            });
            throw error;
        }
    },

    updateIssue: async (issueId: number, issueData: IssueUpdateInput) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/issue/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                },
                body: JSON.stringify(issueData)
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            const updatedIssue: Issue = await res.json();
            
            // Aktualisiere das Issue in der Liste
            const currentIssues = get().issues;
            const updatedIssues = currentIssues.map(issue => 
                issue.id === issueId ? updatedIssue : issue
            );
            
            set({ issues: updatedIssues, isLoading: false });
            return updatedIssue;
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Aktualisieren des Issues',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteIssue: async (issueId: number) => {
        set({ isLoading: true, error: null });

        try {
            const res = await fetch(`${BASE_URL}/v1/issue/${issueId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_LOCAL_STORAGE)}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP-Fehler: ${res.status}`);
            }

            // Entferne das Issue aus der Liste
            const currentIssues = get().issues;
            const updatedIssues = currentIssues.filter(issue => issue.id !== issueId);
            
            set({ issues: updatedIssues, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Fehler beim Löschen des Issues',
                isLoading: false,
            });
            throw error;
        }
    },

    setIssues: (issues: Issue[]) => set({ issues }),
    clearIssues: () => set({ issues: [] }),
}));
