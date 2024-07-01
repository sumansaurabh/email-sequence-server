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
import moment from 'moment';

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
                authTimeout: 3000,
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
                'UNSEEN',
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

            // Filter results to only include emails that are replies to delivered emails
            const filteredResults = results.filter((res) => {
                const headers = res.parts.find(
                    (part) => part.which === 'HEADER',
                ).body;
                return (
                    headers['in-reply-to'] &&
                    deliveredMessageIds.includes(headers['in-reply-to'])
                );
            });

            console.log('Filtered emails:', filteredResults.length);

            for (const res of filteredResults) {
                const part = res.parts.find((part) => part.which === 'TEXT');
                const id = res.attributes.uid;
                const idHeader = 'Imap-Id: ' + id + '\r\n';

                const parsed = await simpleParser(idHeader + part.body);
                console.log(
                    'Email parsed:',
                    parsed.subject,
                    parsed.from.value[0].address,
                    parsed.text,
                );

                if (parsed.headers.has('in-reply-to')) {
                    const originalMsgId = parsed.headers.get('in-reply-to');
                    // Update the database to mark the original email as replied
                    // Example: updateEmailStatusInDatabase(originalMsgId, 'replied')
                    console.log(
                        `Email with Message-ID ${originalMsgId} has been replied to.`,
                    );
                }
            }

            await connection.end();
        } catch (err) {
            console.error('Error processing emails:', err);
            await connection.end();
        }
    }
}
