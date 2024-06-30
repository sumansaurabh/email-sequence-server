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
import { UrlShortener } from 'src/entity/url.shortner';

@Injectable()
export class EmailScheduleService {

    constructor(
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        @InjectRepository(UrlShortener)
        private urlShortnerRepository: Repository<UrlShortener>,
        private emailScheduleService: EmailService,
    ) {}

    async sendScheduledEmails() {
        const scheduledEmailList: Email[] =
            await this.emailScheduleService.fetchScheduledEmails();

        let processed = 0;
        for (const se of scheduledEmailList) {
            try {
                const shouldSendEmail = this.shouldSendEmail(se);
                processed++;
                if (!shouldSendEmail) {
                    continue;
                }
                await this.sendEmail(se);
            } catch (error) {
                console.error(`Error sending email: ${error.message}`);
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
        const filePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
        const source = fs.readFileSync(filePath, 'utf8');
        const template = Handlebars.compile(source);
        return template(data);
    }

    async fetchShortUrl(url: string, clientId: number, userId: number, emailGuid: string): Promise<string> {
        const urlShortener: UrlShortener = await this.urlShortnerRepository.findOne({ where: { url: url } });
        let shortenUrl = "";
        if (urlShortener) {
            shortenUrl = `${process.env.WEB_URL}/${urlShortener.id}`;   
        } else {
            const newUrlShortener = await this.urlShortnerRepository.create({ url: url });
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
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
                user: smtpConfig.auth.user,
                pass: smtpConfig.auth.pass,
            },
        });
        return transporter;
    }

    async sendEmail(se: Email) {
        const emailTemplate = se.outreach.stateList[se.outreachStateId].templateId;
        const client = se.client;
        const mailbox = se.mailbox;
        const sender = mailbox.emailId;
        const senderName = mailbox.name;
        const guid: string = uuidv4();
        let emailContent = this.renderEmailTemplate(emailTemplate, client);
        emailContent = await this.replaceUrlsWithShortenedUrls(emailContent, client.id, se.userId, guid);
        emailContent += `<img src="${process.env.WEB_URL}/email/track/${guid}" style="display:none;" />`;

        try {
            const info = await this.smtpClient(se).sendMail({
                from: `"${senderName}" <${sender}>`,
                to: se.client.emailId,
                subject: se.outreach.subject,
                html: emailContent,
            });
            se.delivered = true;
            se.deliveryStatus = info.response;
        } catch (error) {
            se.delivered = false;
            se.deliveryStatus = error.message;
            se.state = ScheduledEmailState.FAILED;
            await this.emailRepository.save(se);
        }   
    }
}
