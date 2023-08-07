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

  private async sendEmail(subject: string, text: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', 'yooduck.h@gmail.com');
    form.append('subject', subject);
    form.append('text', text);

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

    console.log(response.body);
  }
}
