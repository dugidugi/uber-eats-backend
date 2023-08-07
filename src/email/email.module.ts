import { DynamicModule, Global, Module } from '@nestjs/common';
import { EmailModuleOptions } from './email.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { EmailService } from './email.service';

@Module({})
@Global()
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
