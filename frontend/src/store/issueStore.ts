import { Issue, PaginatedIssueResponse, PaginationParams } from '../utils/types';
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
    pagination: {
        total_count: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    isLoading: boolean;
    error: string | null;
    fetchIssues: (params?: Partial<PaginationParams>) => Promise<void>;
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
    goToPage: (page: number) => Promise<void>;
    nextPage: () => Promise<void>;
    previousPage: () => Promise<void>;
    setPageSize: (limit: number) => Promise<void>;
}

export const useIssueStore = create<IssueStore>((set, get) => ({
    issues: [],
    pagination: {
        total_count: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
    },
    isLoading: false,
    error: null,

    fetchIssues: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const currentState = get();
            
            // Merge current pagination with new params
            const paginationParams = {
                page: params?.page ?? currentState.pagination.page,
                limit: params?.limit ?? currentState.pagination.limit,
            };
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            // Add pagination parameters
            queryParams.append('page', paginationParams.page.toString());
            queryParams.append('limit', paginationParams.limit.toString());

            const url = `/v1/issue?${queryParams.toString()}`;

            const response = await apiClient.get(url);
            const paginatedResponse: PaginatedIssueResponse = response.data;
            
            set({ 
                issues: paginatedResponse.issues, 
                pagination: {
                    total_count: paginatedResponse.total_count,
                    page: paginatedResponse.page,
                    limit: paginatedResponse.limit,
                    total_pages: paginatedResponse.total_pages,
                },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Laden der Issues', isLoading: false });
        }
    },

    createIssue: async (issueData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/v1/issue', issueData);
            const newIssue: Issue = response.data;
            
            // Nach dem Erstellen die erste Seite neu laden, um korrekte Paginierung zu haben
            const { fetchIssues } = get();
            await fetchIssues({ page: 1 });

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

            // Nach dem Löschen die aktuelle Seite neu laden
            const { fetchIssues } = get();
            await fetchIssues();
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message || 'Fehler beim Löschen des Issues', isLoading: false });
            throw error;
        }
    },

    setIssues: (issues) => set({ issues }),
    clearIssues: () => set({ issues: [], pagination: { total_count: 0, page: 1, limit: 10, total_pages: 0 } }),

    goToPage: async (page) => {
        const { fetchIssues } = get();
        await fetchIssues({ page });
    },

    nextPage: async () => {
        const { pagination, fetchIssues } = get();
        if (pagination.page < pagination.total_pages) {
            await fetchIssues({ page: pagination.page + 1 });
        }
    },

    previousPage: async () => {
        const { pagination, fetchIssues } = get();
        if (pagination.page > 1) {
            await fetchIssues({ page: pagination.page - 1 });
        }
    },

    setPageSize: async (limit) => {
        const { fetchIssues } = get();
        await fetchIssues({ page: 1, limit });
    },
}));
