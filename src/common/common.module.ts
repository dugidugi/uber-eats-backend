import { Module } from '@nestjs/common';
import { PUB_SUB } from './common.constant';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

@Module({
  providers: [{ provide: PUB_SUB, useValue: pubsub }],
  exports: [PUB_SUB],
})
export class CommonModule {}
