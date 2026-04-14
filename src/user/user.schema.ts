import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    type: String,
    minlength: [3, 'Name must be at least 3 characters long'], // Fixed: min -> minlength
    maxlength: [50, 'Name must be at most 50 characters long'], // Fixed: max -> maxlength
  })
  name: string = '';

  @Prop({
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  }) // Added trim
  email: string;

  @Prop({
    required: true,
    type: String,
    select: false, // Hidden Fact: Prevents password leak in API responses
    minlength: [6, 'Password must be at least 6 characters long'], // Fixed: min -> minlength
    maxlength: [100, 'Password must be at most 100 characters long'], // Increased for Hashing
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Number, min: [0, 'Age must be a positive number'] })
  age: number;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: Boolean, default: true }) // Fixed: Removed enum from Boolean
  isActive: boolean;

  @Prop({ type: String, select: false }) // Fixed: Hidden from default queries
  verificationCode: string;

  @Prop({ type: String, enum: ['male', 'female'] }) // Fixed: Added type String explicitly
  gender: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
