import authService from './authService';

export interface Issue {
  id: number;
  name: string;
  description: string | null;
  tag_id: number | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

// Interface for issue updates
export interface IssueUpdate {
  name?: string;
  description?: string | null;
  tag_id?: number | null;
}

const API_URL = 'http://localhost:8000/v1/issue';

/**
 * Fetch all issues
 * @returns Promise with array of issues
 */
export const getAllIssues = async (): Promise<Issue[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    const data: Issue[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
};

/**
 * Fetch issues for a specific user
 * @param userId - The user ID
 * @returns Promise with array of issues
 */
export const getIssuesByUser = async (userId: number): Promise<Issue[]> => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch issues for user ${userId}`);
    }

    const data: Issue[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching issues for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get an issue by ID
 * @param issueId - The issue ID
 * @returns Promise with the issue
 */
export const getIssueById = async (issueId: number): Promise<Issue | null> => {
  try {
    const response = await fetch(`${API_URL}/${issueId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch issue ${issueId}`);
    }

    const data: Issue = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching issue ${issueId}:`, error);
    return null;
  }
};

/**
 * Fetch issues with a specific tag
 * @param tagId - The tag ID
 * @returns Promise with array of issues
 */
export const getIssuesByTag = async (tagId: number): Promise<Issue[]> => {
  try {
    const response = await fetch(`${API_URL}/tag/${tagId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch issues for tag ${tagId}`);
    }

    const data: Issue[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching issues for tag ${tagId}:`, error);
    return [];
  }
};

/**
 * Filter issues by time period
 * @param issues - Array of issues to filter
 * @param period - Time period to filter by ('today', 'week', 'month', or null for all)
 * @returns Filtered array of issues
 */
export const filterIssuesByTime = (issues: Issue[], period: 'today' | 'week' | 'month' | null): Issue[] => {
  if (!period || !issues.length) return issues;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return issues.filter(issue => {
    const issueDate = new Date(issue.created_at);
    
    switch (period) {
      case 'today':
        return issueDate >= today;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return issueDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return issueDate >= monthAgo;
      }
      default:
        return true;
    }
  });
};

/**
 * Delete an issue by ID
 * @param issueId - The issue ID to delete
 * @returns Promise with success status
 */
export const deleteIssue = async (issueId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${issueId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete issue ${issueId}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting issue ${issueId}:`, error);
    return false;
  }
};

/**
 * Update an issue
 * @param issueId - The issue ID to update
 * @param issueData - The updated issue data
 * @returns Promise with success status
 */
export const updateIssue = async (issueId: number, issueData: Partial<IssueUpdate>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${issueId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(issueData),
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to update issue ${issueId}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating issue ${issueId}:`, error);
    return false;
  }
};

export default {
  getAllIssues,
  getIssuesByUser,
  getIssueById,
  getIssuesByTag,
  filterIssuesByTime,
  deleteIssue,
  updateIssue,
}; 