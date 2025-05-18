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
    created_by_user_id: number;
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
}