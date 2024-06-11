import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from './email.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password',
    },
  });

  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>,
  ) {}

  async sendEmail(
    recipient: string,
    subject: string,
    body: string,
  ): Promise<Email> {
    const email = this.emailRepository.create({ recipient, subject, body });

    const trackingPixel = `<img src="http://localhost:3000/email/track/${email.id}" style="display:none;" />`;
    const emailBodyWithTracking = `${body}<br>${trackingPixel}<br><a href="http://localhost:3000/email/unsubscribe?email=${recipient}">Unsubscribe</a>`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Your Name" <your-email@example.com>',
        to: recipient,
        subject,
        html: emailBodyWithTracking,
      });
      email.delivered = true;
      email.deliveryStatus = info.response;
    } catch (error) {
      email.delivered = false;
      email.deliveryStatus = error.message;
    }

    return this.emailRepository.save(email);
  }

  async trackEmail(id: number): Promise<void> {
    const email = await this.emailRepository.findOne(id);
    if (email) {
      email.opened = true;
      await this.emailRepository.save(email);
    }
  }

  async unsubscribe(email: string): Promise<void> {
    // Implement your unsubscribe logic here
  }
}
