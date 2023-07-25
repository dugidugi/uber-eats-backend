import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

enum UserRole {
  Client = 'CLIENT',
  Owner = 'OWNER',
  Rider = 'RIDER',
}

registerEnumType(UserRole, { name: 'UserRole' }); //graphQL에 enum등록을 위해 필요

@Entity()
@InputType({ isAbstract: true }) //input type은 실제 스키마의 형태가 아니라 다른 곳에서 extend pick, partial type으로 쓰이기 위해
@ObjectType() //graphQL의 objecttype
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async encryptPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.log(error);
      throw InternalServerErrorException;
    }
  }
}
