import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Retrieve required roles from metadata (checking both method and class levels)
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // 2. Check if the Authorization header is present
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // 3. Verify the JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // 4. Attach the decoded payload to the request object for use in controllers
      request['user'] = payload;

      // 5. If the route is public (no roles defined), allow access
      if (!roles) return true;

      const user = request['user'];

      // 6. Role-based Authorization: Check if the user's role matches the required roles
      const hasRole = roles.includes(user.role);
      if (!hasRole) {
        // Use ForbiddenException (403) for authenticated users with insufficient permissions
        throw new ForbiddenException(
          'You do not have the required permissions',
        );
      }

      return true;
    } catch (error) {
      // If the error is already a ForbiddenException, rethrow it
      if (error instanceof ForbiddenException) throw error;

      // For any other errors (expired, malformed, or invalid tokens), throw 401
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Helper method to extract the Bearer token from the Authorization header
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
