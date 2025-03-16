import authService from './authService';

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const API_URL = 'http://localhost:8000/v1/tag';

/**
 * Fetch all tags
 * @returns Promise with array of tags
 */
export const getAllTags = async (): Promise<Tag[]> => {
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
      throw new Error('Failed to fetch tags');
    }

    const data: Tag[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Get a tag by ID
 * @param tagId - The tag ID
 * @returns Promise with the tag
 */
export const getTagById = async (tagId: number): Promise<Tag | null> => {
  try {
    const response = await fetch(`${API_URL}/${tagId}`, {
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
      throw new Error(`Failed to fetch tag ${tagId}`);
    }

    const data: Tag = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching tag ${tagId}:`, error);
    return null;
  }
};

export default {
  getAllTags,
  getTagById,
}; 