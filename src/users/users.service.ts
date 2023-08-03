import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { VerifyEmailInput } from './dtos/verify-email.dto';
import { Verification } from './entities/verification.entity';
import e from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,

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
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
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

      const verification = this.verifications.create({ user });
      await this.verifications.save(verification);

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
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      console.log(email, password);
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
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

  async editProfile(userId: number, { email, password }: EditProfileInput) {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (email) {
        user.email = email;
      }
      if (password) {
        user.password = password;
      }
      return this.users.save(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async verifyEmail({ code }: VerifyEmailInput) {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      verification.user.verified = true;
      await this.users.save(verification.user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
