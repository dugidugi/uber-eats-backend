import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Rider = 'Rider',
}

registerEnumType(UserRole, { name: 'UserRole' }); //graphQL에 enum등록을 위해 필요

@Entity()
@InputType('UserInputType', { isAbstract: true }) //input type은 실제 스키마에서 사용되지는 않지만, 다른 @InputType에서 상속받아 쓸 수 있게됨 ex) extend pickType, partialType으로 쓰이기 위해
@ObjectType() //graphQL의 object type
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async encryptPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
        throw InternalServerErrorException;
      }
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
