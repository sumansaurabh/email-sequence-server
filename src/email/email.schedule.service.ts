import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/email/email.service';
import {
    Email,
    Priority,
    ScheduledEmailState,
} from 'src/entity/email.entity';
import { v4 as uuidv4 } from 'uuid';


import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { Client } from 'src/entity/client.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UrlShortener } from 'src/entity/url.shortner.entity';
import { TestEmailDto } from './email.dto';
import { MailBoxService } from 'src/mailbox/mailbox.service';
import { ClientService } from 'src/client/client.service';
import { Outreach } from 'src/entity/outreach.entity';

@Injectable()
export class EmailScheduleService {
    smpClient = {};

    priorityOrder = {
        'HIGH': 1,
        'MEDIUM': 2,
        'LOW': 3,
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

    // @Cron(CronExpression.EVERY_10_MINUTES)
    async sendScheduledEmails() {
        console.log('Checking for scheduled emails to send...');
        const scheduledEmailList: Email[] = await this.emailService.fetchScheduledEmails();
        console.log(`Found ${scheduledEmailList.length} scheduled emails`);
        // bring se with priority 1 to the top
        scheduledEmailList.sort((a, b) => this.priorityOrder[a.priority] - this.priorityOrder[b.priority]);

        let processed = 0;
        for (var i = 0; i < scheduledEmailList.length; i++) {
            const se = scheduledEmailList[i];
            if (i > 3) {
                console.log(`Skipping email ${se.id} for client ${se.client.emailId}`);
                se.priority = Priority.HIGH;
                se.scheduled10minInterval = `${this.emailService.get10MinuteCeiling().getTime()}`;
            }
            else {
                try {
                    const shouldSendEmail = this.shouldSendEmail(se);
                    processed++;
                    if (!shouldSendEmail) {
                        console.log(`Skipping email ${se.id} for client ${se.client.emailId}`);
                        continue;
                    }
                    await this.sendEmail(se);                    
                } catch (error) {
                    console.error(`Error sending email: ${error.message}`);
                    console.error(error.stack);
                    se.state = ScheduledEmailState.FAILED;
                }
            }

            await this.emailService.update(se);
        }
    }

    private shouldSendEmail(se: Email): boolean {
        if (se.state === ScheduledEmailState.DELIVERED) {
            return false;
        }
        return se.client.subscribed;
    }

    renderEmailTemplate(templateName: string, data: Client): string {
        const filePath = path.join(__dirname, '../..', 'templates', `${templateName}`);
        console.log(filePath);
        const source = fs.readFileSync(filePath, 'utf8');
        const template = Handlebars.compile(source);
        return template(data);
    }

    async fetchShortUrl(url: string, emailGuid: number): Promise<string> {
        const urlShortener: UrlShortener = await this.urlShortnerRepository.findOne({ where: { url: url } });
        let shortenUrl = "";
        if (urlShortener) {
            console.log(`Creating new short URL for 1 ${urlShortener.id}`);
            shortenUrl = `${process.env.WEB_URL}/email/redirect/${urlShortener.id}`;   
        } else {
            const newUrlShortener = await this.urlShortnerRepository.save({ url: url });
            console.log(newUrlShortener);
            console.log(`Creating new short URL for 2 ${newUrlShortener.id}`);

            shortenUrl = `${process.env.WEB_URL}/email/redirect/${newUrlShortener.id}`;
        }
        return `${shortenUrl}?gid=${emailGuid}`;
    }

    async replaceUrlsWithShortenedUrls(content: string, emailGuid: number): Promise<string> {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (!urls) {
            return content;
        }
        const replacements = await Promise.all(
            urls.map(async (furl) => {
                // remove last character if it is a punctuation
                const url = furl[furl.length - 1].match(/[.,"'!?]/) ? furl.slice(0, -1) : furl;
                const shortUrl = await this.fetchShortUrl(url, emailGuid);
                return { url, shortUrl };
            })
        );
        let modifiedContent = content;
        replacements.forEach(({ url, shortUrl }) => {
            modifiedContent = modifiedContent.replace(url, shortUrl);
        });
        return modifiedContent;
    }

    smtpClient(se: Email): nodemailer.Transporter{
        const smtpConfig = se.mailbox.smtpConfig;
        const uniqueId = `${smtpConfig.host}-${smtpConfig.port}-${smtpConfig.auth.user}`
        if (uniqueId in this.smpClient) {
            return this.smpClient[uniqueId];
        }

        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
                user: smtpConfig.auth.user,
                pass: smtpConfig.auth.pass,
            },
            logger: true, // Enable logger
            debug: true,  // Enable debug output
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
        });
        console.log(`SMTP client created for ${se.mailbox.emailId}`);
        console.log("SMTP Config: ", smtpConfig)
        this.smpClient[uniqueId] = transporter;
        return transporter;
    }

    async scheduleSubsequentEmails(email: Email) {
        const outreach = email.outreach;
        const nextStateId = email.outreachStateId + 1;
        if (nextStateId >= outreach.stateList.length) {
            console.log(`All states completed for outreach ${outreach.name}`);
            return;
        }
        const nextState = outreach.stateList[nextStateId];
        const nextEmail = new Email();
        nextEmail.client = email.client;
        nextEmail.mailbox = email.mailbox;
        nextEmail.outreach = outreach;
        nextEmail.outreachStateId = nextStateId;
        nextEmail.parentMessageId = email.messageId;
        const scheduleAfterDays = nextState.scheduleAfterDays;
        const nextScheduledTime = new Date();
        nextScheduledTime.setDate(nextScheduledTime.getDate() + scheduleAfterDays);
        nextEmail.scheduled10minInterval = `${this.emailService.get10MinuteCeiling(nextScheduledTime).getTime()}`;
        nextEmail.priority = email.priority;
        nextEmail.userId = email.userId;
        nextEmail.taskName = uuidv4();
        await this.emailRepository.save(nextEmail);
        email.mailbox.scheduledCount += 1;
        await this.mailboxService.update(email.mailbox);
    }

    async sendEmail(se: Email) {
        process.env.WEB_URL = "http://localhost:11000/api"
        const emailTemplate = se.outreach.stateList[se.outreachStateId].templateId;
        const client = se.client;
        const mailbox = se.mailbox;
        const sender = mailbox.emailId;
        const senderName = mailbox.name;
        let emailContent = this.renderEmailTemplate(emailTemplate, client);
        let mailSubject = se.outreach.subject.replace(/{{company}}/g, client.company);
        console.log(`Email id: ${se.id}`);
        emailContent = await this.replaceUrlsWithShortenedUrls(emailContent, se.id);
        emailContent += `<img src="${process.env.WEB_URL}/email/track/${se.id}" style="display:none;" />`;
        try {
            const info = await this.smtpClient(se).sendMail({
                from: `"${senderName}" <${sender}>`,
                to: se.client.emailId,
                subject: mailSubject,
                html: emailContent,
            });
            console.log(`Email sent: ${info.response}`);
            se.state = ScheduledEmailState.DELIVERED;
            se.deliveryTime = new Date();
            se.deliveryStatus = info.response;
            se.messageId = info.messageId;
            se.mailbox.sentEmails += 1;
            await this.scheduleSubsequentEmails(se);       
        } catch (error) {
            console.error(`Error sending email: ${error.message}`);
            console.error(error.stack);
            se.deliveryStatus = error.message;
            se.state = ScheduledEmailState.FAILED;
            se.mailbox.failedEmails += 1;
        }
        se.mailbox.scheduledCount -= 1;
        await this.mailboxService.update(mailbox);
    }

    async testEmailService(testEmailDto: TestEmailDto): Promise<Email> {

        const mailbox = await this.mailboxService.findById(testEmailDto.mailboxId);
        const smtpConfig = mailbox.smtpConfig;
        const client = await this.clientService.findById(testEmailDto.clientId);
        const outreach = new Outreach();
        outreach.name = "Test Outreach";
        outreach.subject = "Test Subject";
        outreach.stateList = [{
            name: "Test State",
            templateId: testEmailDto.templateId,
            scheduleAfterDays: 0,
            description: "Test Description",
        }]

        const email: Email = new Email();
        email.id = 345;
        email.mailbox = mailbox;
        email.outreach = outreach;
        email.client = client;
        email.outreachStateId = 0;
        email.scheduled10minInterval = `${this.emailService.get10MinuteCeiling().getTime()}`;
        email.priority = Priority.MEDIUM;
        email.userId = testEmailDto.userId;
        email.taskName = uuidv4();
        await this.sendEmail(email);
        return email;
    }
}
