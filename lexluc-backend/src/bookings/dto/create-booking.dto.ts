import { IsString, IsEmail, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export class CreateBookingDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  numberOfTravelers: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalPrice?: number;

  @IsString()
  tourId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}

// Legacy DTO for backward compatibility
export class CreateBookingDtoLegacy {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsNumber()
  @Type(() => Number)
  numberOfParticipants: number;

  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @IsString()
  tourId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}