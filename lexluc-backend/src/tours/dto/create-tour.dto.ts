import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TourStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export class CreateTourDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsString()
  departureLocation?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(TourStatus)
  status: TourStatus;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  availableSlots?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discount?: number;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  itinerary?: { day: number; title: string; description: string }[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  // Legacy fields for backward compatibility
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsString()
  serviceId?: string;
}

// Update DTO - simple interface without PartialType
export interface UpdateTourDto {
  title?: string;
  slug?: string;
  category?: string;
  destination?: string;
  departureLocation?: string;
  shortDescription?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: TourStatus;
  price?: number;
  currency?: string;
  availableSlots?: number;
  discount?: number;
  featuredImage?: string;
  gallery?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  inclusions?: string[];
  exclusions?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  content?: string;
  duration?: number;
  maxParticipants?: number;
  highlights?: string[];
  serviceId?: string;
}