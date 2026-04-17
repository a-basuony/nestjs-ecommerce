import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
// import { Request } from 'express';
import * as express from 'express'; // Fixed Import
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
// Import the Role Enum from your decorator file
import { Roles, Role } from '../common/decorators/roles.decorators';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.Admin) // ✅ FIX: Use the Enum instead of the string 'admin'
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() payload: express.Request,
  ) {
    console.log('Decoded User Payload:', payload['user']);
    return this.userService.create(createUserDto, payload['user']);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
