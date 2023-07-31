import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const qglContext = GqlExecutionContext.create(context).getContext();
    const user = qglContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
