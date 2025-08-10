import { IsString, IsNotEmpty, IsIn, IsBoolean } from 'class-validator';

/**
 * DTO for updating user role
 */
export class RoleUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'admin'], { message: 'Role must be either "user" or "admin"' })
  roleName: 'user' | 'admin';
}

/**
 * DTO for deactivating user
 */
export class DeactivateUserDto {
  @IsBoolean()
  deactivate: boolean;
}
