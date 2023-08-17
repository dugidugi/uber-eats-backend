import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { EmailModuleOptions } from './email.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class EmailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOptions,
  ) {
    // this.sendEmail('testing', 'test');
  }

  async sendEmail({
    subject,
    to,
    text,
    options,
    template,
  }: {
    subject: string;
    to: string;
    text?: string;
    options?: object;
    template: string;
  }): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    if (text) {
      form.append('text', text);
    }
    form.append('template', template);
    if (options) {
      form.append('t:variables', JSON.stringify(options));
    }

    try {
      const response = await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail({ email, code }: { email: string; code: string }) {
    this.sendEmail({
      subject: 'Verify Your Email',
      to: email,
      template: 'verify-email',
      options: {
        link: `http://nuber.com/verification/${code}`,
      },
    });
  }
}
