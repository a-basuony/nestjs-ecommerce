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
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
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
  async findAll(query: any): Promise<IServiceResponse<User[]>> {
    // 1. extract pagination and filtering parameters from query
    const page = Math.max(Number(query.page) || 1, 1); // to prevent numbers less that 1
    let limit = Math.max(Number(query.limit) || 10, 1);
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;

    // 2. searching by name or email
    const safeSearch = query.search
      ? query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : '';
    const searchFilter = safeSearch
      ? {
          $or: [
            { name: { $regex: safeSearch, $options: 'i' } },
            { email: { $regex: safeSearch, $options: 'i' } },
          ],
        }
      : {};

    // 3. filter by role & isActive
    const allowedFilters = ['role', 'isActive', 'gender'];
    const filter: any = { ...searchFilter };

    allowedFilters.forEach((key) => {
      if (query[key] !== undefined) {
        filter[key] = query[key];
      }
    });

    if (query.role) filter['role'] = query.role;
    if (query.isActive) filter['isActive'] = query.isActive === 'true';

    // 4. Sort by creation date (newest first) and apply pagination
    // ?sort=-createdAt descending order or ?sort=createdAt for ascending order

    let sort = { createdAt: -1 } as any; // default sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-')
        ? query.sort.substring(1)
        : query.sort;
      const sortOrder = query.sort.startsWith('-') ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    console.log({ query, filter, sort });
    // 5. execute query with filters, sorting, and pagination

    const [users, totalItems] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -verificationCode -__v')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // if (users.length === 0) {
    //   throw new NotFoundException('No users found');
    // }

    // instead of throwing
    if (users.length === 0) {
      return {
        status: 200,
        message: 'No users found',
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    // 6. return response with pagination metadata

    return {
      status: 200,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        totalItems,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
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
