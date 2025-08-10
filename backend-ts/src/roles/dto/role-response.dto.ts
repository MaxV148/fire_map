/**
 * DTO for role response
 */
export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
