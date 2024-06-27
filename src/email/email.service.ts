// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Email } from '../entity/email.entity';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class EmailService {
//   private transporter = nodemailer.createTransport({
//     host: 'smtp.example.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: 'your-email@example.com',
//       pass: 'your-password',
//     },
//   });

//   constructor(
//     @InjectRepository(Email)
//     private emailRepository: Repository<Email>,
//     @InjectRepository(EmailSequence)
//     private emailSequenceRepository: Repository<EmailSequence>,
//   ) {}

//   async createSequence(
//     sequenceName: string,
//     recipient: string,
//     emails: { subject: string; body: string; daysAfterPrevious: number }[],
//   ) {
//     for (const emailData of emails) {
//       const email = this.emailRepository.create({
//         recipient,
//         subject: emailData.subject,
//         body: emailData.body,
//       });
//       await this.emailRepository.save(email);

//       const emailSequence = this.emailSequenceRepository.create({
//         sequenceName,
//         email,
//         daysAfterPrevious: emailData.daysAfterPrevious,
//       });
//       await this.emailSequenceRepository.save(emailSequence);
//     }
//   }

//   async sendScheduledEmails() {
//     const sequences = await this.emailSequenceRepository.find({
//       where: { sent: false },
//       relations: ['email'],
//     });

//     for (const sequence of sequences) {
//       const shouldSendEmail = this.shouldSendEmail(sequence);
//       if (shouldSendEmail) {
//         await this.sendEmail(sequence.email);
//         sequence.sent = true;
//         await this.emailSequenceRepository.save(sequence);
//       }
//     }
//   }

//   private shouldSendEmail(sequence: EmailSequence): boolean {
//     const previousEmailDate = new Date(sequence.createdAt);
//     const sendDate = new Date(
//       previousEmailDate.getTime() +
//         sequence.daysAfterPrevious * 24 * 60 * 60 * 1000,
//     );
//     return new Date() >= sendDate;
//   }

//   async sendEmail(email: Email) {
//     const trackingPixel = `<img src="${process.env.WEB_URL}/email/track/${email.id}" style="display:none;" />`;
//     const emailBodyWithTracking = `${email.body}<br>${trackingPixel}<br><a href="${process.env.WEB_URL}/email/unsubscribe?email=${email.recipient}">Unsubscribe</a>`;

//     try {
//       const info = await this.transporter.sendMail({
//         from: '"Your Name" <your-email@example.com>',
//         to: email.recipient,
//         subject: email.subject,
//         html: emailBodyWithTracking,
//       });
//       email.delivered = true;
//       email.deliveryStatus = info.response;
//     } catch (error) {
//       email.delivered = false;
//       email.deliveryStatus = error.message;
//     }

//     await this.emailRepository.save(email);
//   }

//   async trackEmail(id: number): Promise<void> {
//     const email = await this.emailRepository.findOne(id);
//     if (email) {
//       email.opened = true;
//       await this.emailRepository.save(email);
//     }
//   }

//   async unsubscribe(email: string): Promise<void> {
//     // Implement your unsubscribe logic here
//   }
// }
