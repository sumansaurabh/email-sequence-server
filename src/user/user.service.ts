import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from '../entity/email.entity';
import { EmailSequence } from './email-sequence.entity';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  saltOrRounds: number = 10;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltOrRounds);
    return hash;
  }
  async signup(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
  ) {
    const encodedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: encodedPassword,
      isActive: true,
    });

    await this.userRepository.save(user);
  }

  async sendScheduledEmails() {
    const sequences = await this.emailSequenceRepository.find({
      where: { sent: false },
      relations: ['email'],
    });

    for (const sequence of sequences) {
      const shouldSendEmail = this.shouldSendEmail(sequence);
      if (shouldSendEmail) {
        await this.sendEmail(sequence.email);
        sequence.sent = true;
        await this.emailSequenceRepository.save(sequence);
      }
    }
  }

  private shouldSendEmail(sequence: EmailSequence): boolean {
    const previousEmailDate = new Date(sequence.createdAt);
    const sendDate = new Date(
      previousEmailDate.getTime() +
        sequence.daysAfterPrevious * 24 * 60 * 60 * 1000,
    );
    return new Date() >= sendDate;
  }

  async sendEmail(email: Email) {
    const trackingPixel = `<img src="${process.env.WEB_URL}/email/track/${email.id}" style="display:none;" />`;
    const emailBodyWithTracking = `${email.body}<br>${trackingPixel}<br><a href="${process.env.WEB_URL}/email/unsubscribe?email=${email.recipient}">Unsubscribe</a>`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Your Name" <your-email@example.com>',
        to: email.recipient,
        subject: email.subject,
        html: emailBodyWithTracking,
      });
      email.delivered = true;
      email.deliveryStatus = info.response;
    } catch (error) {
      email.delivered = false;
      email.deliveryStatus = error.message;
    }

    await this.emailRepository.save(email);
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
