import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must be at most 100 characters long' })
  password: string;

  @IsEnum(['admin', 'user'], { message: 'Role must be either admin or user' })
  @IsOptional() // Optional because the schema has a default value
  role?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  @Min(0, { message: 'Age must be a positive number' })
  @IsOptional()
  age?: number;

  @IsPhoneNumber(undefined, {
    message:
      'Phone number must be a valid international format (e.g., +966... or +20...)',
  })
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  gender?: 'male' | 'female';
}
