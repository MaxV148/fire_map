/**
 * DTO for tag response in issues
 */
export class IssueTagResponseDto {
  id: number;
  name: string;
}

/**
 * DTO for issue response
 */
export class IssueResponseDto {
  id: number;
  name: string;
  description?: string;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  tags: IssueTagResponseDto[];
  location?: [number, number]; // [longitude, latitude]
}
