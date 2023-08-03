import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
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
@InputType({ isAbstract: true }) //input type은 실제 스키마에서 사용되지는 않지만, 다른 @InputType에서 상속받아 쓸 수 있게됨 ex) extend pickType, partialType으로 쓰이기 위해
@ObjectType() //graphQL의 object type
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

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
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
