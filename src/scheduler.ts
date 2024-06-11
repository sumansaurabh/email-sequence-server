import { EmailService } from './email/email.service';
import * as cron from 'node-cron';

/**
 * Sets up an email scheduler that runs every hour to send scheduled emails.
 * 
 * @param emailService The EmailService instance to use for sending emails.
 * @throws Error if there is an issue with scheduling or sending emails.
 */
export function setupEmailScheduler(emailService: EmailService) {
  cron.schedule('0 * * * *', async () => {
    console.log('Checking for scheduled emails to send...');
    await emailService.sendScheduledEmails();
  });
}
