import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ContactMessageStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED',
}

export class UpdateContactMessageStatusDto {
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;
}

export class UpdateContactMessageResponseDto {
  @IsString()
  @MaxLength(5000)
  response: string;
}

export class ContactListQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | 'subject' | 'status';

  @IsOptional()
  @IsString()
  sortDir?: 'asc' | 'desc';
}
