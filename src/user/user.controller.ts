import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
// Import the Role Enum from your decorator file
import { Roles, Role } from '../common/decorators/roles.decorators';
import { AuthGuard } from '../common/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
// @UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @desc Create a new user
  // @route POST /api/v1/users
  // @access Private (Admin only)
  // @param {CreateUserDto} createUserDto - The data transfer object for creating a user
  // @returns {Promise<{ status: number; message: string; user: any }>} The created user data
  // @Roles(Role.Admin) // ✅ FIX: Use the Enum instead of the string 'admin'
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // @desc Get all users
  // @route GET /api/v1/users
  // @access Private (Admin only)
  @Get()
  // @Roles(Role.Admin)
  findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  // @desc Get a user by ID
  // @route GET /api/v1/users/:id
  // @access Private (Admin only)
  @Get(':id')
  // @Roles(Role.Admin)
  // findOne(@Req() req: express.Request) {
  // const { id } = req.params;
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // @desc Update a user by ID
  // @route PUT /api/v1/users/:id
  // @access Private (Admin only)
  @Put(':id')
  // @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // @desc Delete a user by ID
  // @route DELETE /api/v1/users/:id
  // @access Private (Admin only)
  @Delete(':id')
  // @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
