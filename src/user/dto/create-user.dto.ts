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
  IsUrl,
  Length,
  IsPhoneNumber,
} from 'class-validator';

// 🔥 Enums
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateUserDto {
  // 🧑 Name
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  // 📧 Email
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  // 🔐 Password
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must be at most 100 characters long' })
  password: string;

  // 👑 Role
  @IsEnum(Role, { message: 'Role must be admin or user' })
  @IsOptional()
  role?: Role;

  // 🖼 Avatar
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @IsOptional()
  avatar?: string;

  // 🎂 Age
  @IsNumber()
  @Min(0, { message: 'Age must be a positive number' })
  @IsOptional()
  age?: number;

  // 📱 Phone (EG 🇪🇬 + SA 🇸🇦 only)
  @IsOptional()
  @IsString()
  @IsPhoneNumber('EG', {
    message: 'Phone must be a valid Egyptian number',
  })
  @IsPhoneNumber('SA', {
    message: 'Phone must be a valid Saudi number',
  })
  phoneNumber?: string;

  // 📍 Address
  @IsString()
  @IsOptional()
  address?: string;

  // 🟢 Active
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // 🔑 Verification Code
  @IsString()
  @Length(6, 6, {
    message: 'Verification code must be exactly 6 characters',
  })
  @IsOptional()
  verificationCode?: string;

  // 🚻 Gender
  @IsEnum(Gender, { message: 'Gender must be male or female' })
  @IsOptional()
  gender?: Gender;
}
