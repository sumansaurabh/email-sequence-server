import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/email/email.service';
import {
    Email,
    ScheduledEmailState,
} from 'src/entity/email.entity';
import { v4 as uuidv4 } from 'uuid';


import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { Client } from 'src/entity/client.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UrlShortener } from 'src/entity/url.shortner.entity';

@Injectable()
export class EmailScheduleService {
    smpClient = {};
    constructor(
        @InjectRepository(UrlShortener)
        private urlShortnerRepository: Repository<UrlShortener>,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        private emailScheduleService: EmailService,
    ) {}

    @Cron(CronExpression.EVERY_10_MINUTES)
    async sendScheduledEmails() {
        console.log('Checking for scheduled emails to send...');
        const scheduledEmailList: Email[] =
            await this.emailScheduleService.fetchScheduledEmails();
        console.log(`Found ${scheduledEmailList.length} scheduled emails`);

        let processed = 0;
        for (const se of scheduledEmailList) {
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
            await this.emailScheduleService.update(se);
        }
    }

    private shouldSendEmail(se: Email): boolean {
        if (se.state === ScheduledEmailState.SENT) {
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

    async fetchShortUrl(url: string, clientId: number, userId: number, emailGuid: string): Promise<string> {
        const urlShortener: UrlShortener = await this.urlShortnerRepository.findOne({ where: { url: url } });
        let shortenUrl = "";
        if (urlShortener) {
            console.log(`Creating new short URL for 1 ${urlShortener.id}`);
            shortenUrl = `${process.env.WEB_URL}/${urlShortener.id}`;   
        } else {
            const newUrlShortener = await this.urlShortnerRepository.save({ url: url });
            console.log(newUrlShortener);
            console.log(`Creating new short URL for 2 ${newUrlShortener.id}`);

            shortenUrl = `${process.env.WEB_URL}/${newUrlShortener.id}`;
        }
        return `${shortenUrl}?cid=${clientId}&uid=${userId}&gid=${emailGuid}`;
    }

    async replaceUrlsWithShortenedUrls(content: string, clientId: number, userId: number, emailGuid: string): Promise<string> {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (!urls) {
            return content;
        }
        const replacements = await Promise.all(
            urls.map(async (url) => {
                const shortUrl = await this.fetchShortUrl(url, clientId, userId, emailGuid);
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

    async sendEmail(se: Email) {
        process.env.WEB_URL = "http://localhost:11000/api"
        const emailTemplate = se.outreach.stateList[se.outreachStateId].templateId;
        const client = se.client;
        const mailbox = se.mailbox;
        const sender = mailbox.emailId;
        const senderName = mailbox.name;
        const guid: string = uuidv4();
        let emailContent = this.renderEmailTemplate(emailTemplate, client);
        console.log(`Email content: ${emailContent}`);
        emailContent = await this.replaceUrlsWithShortenedUrls(emailContent, client.id, se.userId, guid);
        emailContent += `<img src="${process.env.WEB_URL}/email/track/${guid}" style="display:none;" />`;
        console.log(`Email content after URL replacement: ${emailContent}`);
        try {
            console.log(`Sending email to ${se.client.emailId}`);
            console.log(`subject: ${se.outreach.subject}`);
            console.log(`name: ${senderName}`);
            const info = await this.smtpClient(se).sendMail({
                from: `"${senderName}" <${sender}>`,
                to: se.client.emailId,
                subject: "Hello world",
                html: emailContent,
            });
            console.log(`Email sent: ${info.response}`);
            
            se.delivered = true;
            se.deliveryStatus = info.response;
        } catch (error) {
            console.error(`Error sending email: ${error.message}`);
            console.error(error.stack);
            se.delivered = false;
            se.deliveryStatus = error.message;
            se.state = ScheduledEmailState.FAILED;
            await this.emailRepository.save(se);
        }   
    }
}
