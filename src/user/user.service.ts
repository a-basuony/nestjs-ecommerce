import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

// Local interface for standardized responses
export interface IServiceResponse<T> {
  status: number;
  message: string;
  data?: T;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
  }

  // @desc Create a new user
  // @route POST /api/v1/users
  // @access Private (Admin only)
  // @param {CreateUserDto} createUserDto - The data transfer object for creating a user
  // @returns {Promise<{ status: number; message: string; user: any }>} The created user data
  async create(dto: CreateUserDto): Promise<IServiceResponse<User>> {
    // 1. check if email already exists
    const existingUser = await this.userModel
      .findOne({ email: dto.email })
      .select('_id')
      .lean();
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      password: hashedPassword,
      // role: dto.role || 'user', // hardcoded default role, can be improved by using an Enum or a constant
      role: dto.role || Role.User, // ✅ FIX: Use the Enum instead of the string 'user'
    });

    // remove sensitive data before returning
    const user = newUser.toObject() as any;
    delete user.password;
    delete user.verificationCode;
    delete user.__v;

    return {
      status: 201,
      message: 'User created successfully',
      data: user,
    };
  }

  // @desc Get all users
  // @route GET /api/v1/users
  // @access Private (Admin only)
  // @returns {Promise<User[]>} An array of all users
  // need pagination and filtering by role and isActive
  async findAll(): Promise<IServiceResponse<User[]>> {
    const users = await this.userModel
      .find()
      .select('-password -verificationCode -__v')
      .lean();

    return {
      status: 200,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  // @desc Get a user by ID
  // @route GET /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to retrieve
  // @returns {Promise<User>} The user object with the specified ID
  async findOne(id: string): Promise<IServiceResponse<User>> {
    // if (!Types.ObjectId.isValid(id)) {
    //   throw new BadRequestException('Invalid user ID');
    // }

    this.validateObjectId(id); // ✅ FIX: Use a helper method for ObjectId validation
    const user = await this.userModel
      .findById(id)
      .select('-password -verificationCode -__v')
      .lean();

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  // @desc Update a user by ID
  // @route PUT /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to update
  // @param {UpdateUserDto} updateUserDto - The data transfer object for updating a user
  // @returns {Promise<User>} The updated user object
  async update(
    @Param('id') id: string,
    dto: UpdateUserDto,
  ): Promise<IServiceResponse<User>> {
    // if (!Types.ObjectId.isValid(id)) {
    //   throw new BadRequestException('Invalid user ID');
    // }

    this.validateObjectId(id); // ✅ FIX: Use a helper method for ObjectId validation

    if (dto.email) {
      const existingUser = await this.userModel
        .findOne({ email: dto.email })
        .select('_id')
        .lean();
      if (existingUser && existingUser._id.toString() !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData = { ...dto };

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(dto.password, salt);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select('-password -verificationCode -__v')
      .lean();

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User updated successfully',
      data: user,
    };
  }

  // @desc Remove a user by ID
  // @route DELETE /api/v1/users/:id
  // @access Private (Admin only)
  // @param {string} id - The ID of the user to remove
  // @returns {Promise<{ status: number; message: string }>} A message indicating the result of the operation
  async remove(id: string): Promise<{ status: number; message: string }> {
    // if (!Types.ObjectId.isValid(id)) {
    //   throw new BadRequestException('Invalid user ID');
    // }
    this.validateObjectId(id); // ✅ FIX: Use a helper method for ObjectId validation
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) throw new NotFoundException('User not found');

    return {
      status: 200,
      message: 'User removed successfully',
    };
  }
}
