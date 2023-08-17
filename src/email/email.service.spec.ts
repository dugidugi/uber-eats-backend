import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { CONFIG_OPTIONS } from 'src/common/common.constant';

describe('EmailService', () => {
  let service: EmailService;

  jest.mock('got', () => {});
  jest.mock('form-data', () => {
    return { append: jest.fn() };
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: 'test-domain',
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = { email: 'email', code: 'code' };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});

      service.sendVerificationEmail(sendVerificationEmailArgs);

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith({
        subject: 'Verify Your Email',
        to: sendVerificationEmailArgs.email,
        template: 'verify-email',
        options: {
          link: `http://nuber.com/verification/${sendVerificationEmailArgs.code}`,
        },
      });
    });
  });

  it.todo('sendEmail');
});
