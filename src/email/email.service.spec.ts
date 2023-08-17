import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import * as FormData from 'form-data';
import got from 'got';

const TEST_DOMAIN = 'test-domain';
jest.mock('got');
jest.mock('form-data');

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
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

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

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

  describe('sendEmail', () => {
    it('should send email', async () => {
      const ok = await service.sendEmail({
        subject: 'subject',
        to: 'to',
        text: 'text',
        template: 'template',
      });
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();

      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });

    it('should fail on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail({
        subject: 'subject',
        to: 'to',
        text: 'text',
        template: 'template',
      });
      expect(ok).toEqual(false);
    });
  });
});
