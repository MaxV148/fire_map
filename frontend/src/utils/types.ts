export interface Tag {
    id: number;
    name: string;
}

export interface VehicleType {
    id: number;
    name: string;
}

export interface Event {
    id: number;
    name: string;
    description: string;
    location: number[];
    tags: Tag[];
    vehicles: VehicleType[];
    created_by: number;
    created_at: string;
}

export interface Issue {
    id: number;
    name: string;
    description: string;
    created_by_user_id: string;
    tags: Tag[];
    location: number[];
    created_at: string;
  }



export interface EventUpdateInput {
    name?: string;
    description?: string;
    location?: number[];
    tag_ids?: number[];
    vehicle_ids?: number[];
}

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string; // ISO format
    otp_configured: boolean;
    role: string;
    deactivated: boolean;
}


export interface PaginatedEventResponse {
    events: Event[];
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface PaginatedIssueResponse {
    issues: Issue[];
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export enum UserRole {
    USER = 2,
    ADMIN = 1
}