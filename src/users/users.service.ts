import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInputDto } from './dtos/create-account.dto';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  getAll() {
    return 'hi';
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInputDto): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return {
          ok: false,
          error: 'user already exists',
        };
      }
      const user = this.users.create({ email, password, role });
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async login({
    email,
    password,
  }: LoginInputDto): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return {
          ok: false,
          error: 'user not found',
        };
      }
      const passwordVerified = await user.verifyPassword(password);
      if (!passwordVerified) {
        return {
          ok: false,
          error: 'wrong password',
        };
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findById(id: number): Promise<User> {
    try {
      return this.users.findOne({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
