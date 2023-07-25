import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInputDto } from './dtos/create-account.dto';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
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
      return {
        ok: true,
        token: 'temperal token',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
