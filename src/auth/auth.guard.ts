import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const qglContext = GqlExecutionContext.create(context).getContext();
    const user = qglContext['user'];

    if (!user) {
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
