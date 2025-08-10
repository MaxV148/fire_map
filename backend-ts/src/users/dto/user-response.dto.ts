/**
 * DTO for user response
 */
export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  role: string;
  deactivated: boolean;
}

/**
 * DTO for current user (me) response
 */
export class MeResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  otpConfigured: boolean;
  role: string;
}

/**
 * DTO for paginated users response
 */
export class PaginatedUserResponseDto {
  users: UserResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
