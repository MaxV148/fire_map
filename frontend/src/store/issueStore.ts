import { Issue, Tag } from '../utils/types';
import { create } from 'zustand';
import { BASE_URL } from '../utils/constants';

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
            const response = await fetch(`${BASE_URL}/v1/issue`, {
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Issues');
            }

            const issues: Issue[] = await response.json();
            set({ issues, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createIssue: async (issueData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(issueData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Issues');
            }

            const newIssue: Issue = await response.json();
            set(state => ({
                issues: [...state.issues, newIssue],
                isLoading: false
            }));

            return newIssue;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateIssue: async (issueId, issueData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/issue/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
                body: JSON.stringify(issueData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Issues');
            }

            const updatedIssue: Issue = await response.json();
            
            set(state => ({
                issues: state.issues.map(issue => 
                    issue.id === issueId ? updatedIssue : issue
                ),
                isLoading: false
            }));

            return updatedIssue;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteIssue: async (issueId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${BASE_URL}/v1/issue/${issueId}`, {
                method: 'DELETE',
                credentials: 'include', // Session-Cookie wird automatisch mitgesendet
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Issues');
            }

            set(state => ({
                issues: state.issues.filter(issue => issue.id !== issueId),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setIssues: (issues) => set({ issues }),
    clearIssues: () => set({ issues: [] }),
}));
