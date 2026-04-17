import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

// Local interface for standardized responses
interface IServiceResponse<T> {
  status: number;
  message: string;
  user?: T;
  users?: T[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // @desc Create a new user
  // @route POST /api/v1/users
  // @access Private (Admin only)
  // @param {CreateUserDto} createUserDto - The data transfer object for creating a user
  // @returns {Promise<{ status: number; message: string; user: any }>} The created user data
  async create(dto: CreateUserDto): Promise<IServiceResponse<any>> {
    // 1. check if email already exists
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || 'user',
    });

    // remove sensitive data before returning
    const user = newUser.toObject();
    delete user.password;
    delete user.verificationCode;
    delete user.__v;

    return {
      status: 201,
      message: 'User created successfully',
      user,
    };
  }

  // @desc Get all users
  // @route GET /api/v1/users
  // @access Private (Admin only)
  // @returns {Promise<User[]>} An array of all users
  // need pagination and filtering by role and isActive
  async findAll(): Promise<IServiceResponse<any>> {
    const users = await this.userModel
      .find()
      .select('-password -verificationCode -__v')
      .lean();

    return {
      status: 200,
      message: 'Users retrieved successfully',
      users,
    };
  }

  // @desc Get a user by ID
  // @route GET /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to retrieve
  // @returns {Promise<User>} The user object with the specified ID
  async findOne(id: string): Promise<IServiceResponse<any>> {
    const user = await this.userModel
      .findById(id)
      .select('-password -verificationCode -__v')
      .lean();

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User retrieved successfully',
      user,
    };
  }

  // @desc Update a user by ID
  // @route PUT /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to update
  // @param {UpdateUserDto} updateUserDto - The data transfer object for updating a user
  // @returns {Promise<User>} The updated user object
  async update(id: string, dto: UpdateUserDto): Promise<IServiceResponse<any>> {
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password -verificationCode -__v')
      .lean();

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User updated successfully',
      user,
    };
  }

  // @desc Remove a user by ID
  // @route DELETE /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to remove
  // @returns {Promise<{ status: number; message: string }>} A message indicating the result of the operation
  async remove(id: string): Promise<{ status: number; message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User removed successfully',
    };
  }
}
