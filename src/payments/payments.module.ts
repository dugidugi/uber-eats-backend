import { Module } from '@nestjs/common';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';

@Module({
  providers: [PaymentResolver, PaymentService],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class PaymentsModule {}
