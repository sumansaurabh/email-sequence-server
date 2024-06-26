import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from 'src/email/email.service';
import { Email } from 'src/entity/email.entity';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UrlShortener } from 'src/entity/url.shortner.entity';
import { MailBoxService } from 'src/mailbox/mailbox.service';
import { ClientService } from 'src/client/client.service';
import { MailBox } from 'src/entity/mailbox.entity';
import * as moment from 'moment';

@Injectable()
export class EmailFetchService {
    imapClient = {};

    priorityOrder = {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
    };
    constructor(
        @InjectRepository(UrlShortener)
        private urlShortnerRepository: Repository<UrlShortener>,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        private emailService: EmailService,
        private mailboxService: MailBoxService,
        private clientService: ClientService,
    ) {}

    // @Cron(CronExpression.EVERY_30_SECONDS)
    // async sendScheduledEmails() {
    //     console.log('Fetching emails to check if the response has been recieved...');
    //     const email =
    //         await this.fetchLatestEmail();
    // }

    async runEmailDeliveredCron() {
        const mailboxes = await this.mailboxService.findAll();
        for (const mailbox of mailboxes) {
            await this.checkEmail(mailbox);
        }
    }

    async getImapConnection(mailbox: MailBox): Promise<any> {
        const imapConfig = {
            imap: {
                user: mailbox.imapConfig.auth.user,
                password: mailbox.imapConfig.auth.pass,
                host: mailbox.imapConfig.host,
                port: mailbox.imapConfig.port,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
                authTimeout: 60000,
            },
        };
        console.log(
            'Connecting to imap email server:',
            mailbox.imapConfig.auth.user,
        );
        console.log('IMAP Config:', imapConfig);

        try {
            const connection = await imaps.connect(imapConfig);
            await connection.openBox('INBOX');
            return connection;
        } catch (error) {
            console.error('Error connecting to IMAP server:', error);
            throw error;
        }
    }

    async checkEmail(mailbox: MailBox): Promise<void> {
        if (!mailbox.shouldCheckReplies) {
            return;
        }
        if (!mailbox.imapConfig) {
            console.log('IMAP config not found for mailbox:', mailbox.id);
            return;
        }
        if (mailbox.scheduledCount === 0) {
            console.log('No emails scheduled for mailbox:', mailbox.id);
            return;
        }

        const deliveredEmails =
            await this.emailService.fetchDeliveredEmails(mailbox);

        console.log('Delivered emails:', deliveredEmails.length);

        console.log('gettng connection:', mailbox.id);
        const connection = await this.getImapConnection(mailbox);
        console.log('connection received:', connection);
        if (!connection) {
            console.error('Error connecting to email server:', mailbox.id);
            return;
        }
        console.log('Checking emails for mailbox:', mailbox.id);
        try {
            // Get the list of message IDs from the delivered emails
            const deliveredMessageIds = deliveredEmails.map(
                (email) => email.messageId,
            );

            const searchCriteria = [
                ['SINCE', moment().subtract(4, 'hour').toDate()],
            ];
            const fetchOptions = {
                bodies: ['HEADER.FIELDS (MESSAGE-ID IN-REPLY-TO)'],
            };
            const results = await connection.search(
                searchCriteria,
                fetchOptions,
            );

            console.log('Emails found:', results.length);

            if (results.length === 0) {
                console.log('No unseen emails to fetch.');
                await connection.end();
                return;
            }
            console.log('Emails found:', results.length);
            console.log('Delivered emails:', deliveredMessageIds);
            // Filter results to only include emails that are replies to delivered emails
            const repliedMessageIds = [];
            const filteredResults = results.filter((res) => {
                let headers = res.parts.find(
                    (part) => part.which === 'HEADER.FIELDS (MESSAGE-ID IN-REPLY-TO)',
                );
                if (!headers) {
                    return false;
                }
                headers = headers.body;
                if (!headers['in-reply-to']) {
                    return false;
                }
                for (const id of headers['in-reply-to']) {
                    if(deliveredMessageIds.includes(id)) {
                        repliedMessageIds.push(id);
                        return true;
                    }
                }
                return false;
            });

            console.log('Filtered emails:', filteredResults.length);
            for(const rId of repliedMessageIds) {
                await this.emailService.updateEmailReplied(rId);
            }
            await connection.end();
        } catch (err) {
            console.error('Error processing emails:', err);
            await connection.end();
        }
    }
}
