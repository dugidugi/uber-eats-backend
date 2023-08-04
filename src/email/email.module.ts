import { DynamicModule, Global, Module } from '@nestjs/common';
import { EmailModuleOptions } from './email.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constant';

@Module({})
@Global()
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      //   exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        // JwtService,
      ],
    };
  }
}
