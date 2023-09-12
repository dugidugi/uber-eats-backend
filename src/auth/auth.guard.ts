import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './auth.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const qglContext = GqlExecutionContext.create(context).getContext();

    const token = qglContext['token'];

    if (!token) {
      return false;
    }

    const docoded = this.jwtService.verify(token);
    if (typeof docoded === 'object' && docoded.hasOwnProperty('id')) {
      const { user } = await this.usersService.findById(docoded['id']);

      if (!user) {
        return false;
      }

      if (user) {
        qglContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      }
    }
  }
}
