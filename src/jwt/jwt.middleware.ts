import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class jwtMiddleWare implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['x-jwt']) {
      try {
        const docoded = this.jwtService.verify(req.headers['x-jwt']);
        if (typeof docoded === 'object' && docoded.hasOwnProperty('id')) {
          try {
            const user = await this.usersService.findById(docoded['id']);
            req['user'] = user;
            console.log('user', req['user']);
          } catch (error) {
            console.log(error);
          }
          req['user'] = docoded;
        }
      } catch (error) {
        console.log(error);
      }
    }
    next();
  }
}
