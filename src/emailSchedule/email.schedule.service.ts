// src/users/outreach.service.ts
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outreach } from 'src/entity/outreach.entity';
import { UserService } from 'src/users/user.service';
import { OutreachService } from 'src/outreach/outreach.service';
import { MailBoxService } from 'src/mailbox/mailbox.service';
import { ScheduledEmail } from 'src/entity/scheduled.email.entity';
import { ClientService } from 'src/client/client.service';
import { v4 as uuidv4 } from 'uuid';
import { MailBox } from 'src/entity/mailbox.entity';


@Injectable()
export class EmailScheduleService {
    saltOrRounds: number = 10;

    constructor(
        private userService: UserService,
        private outreachService: OutreachService,
        private clientService: ClientService,
        private mailboxService: MailBoxService,
        @InjectRepository(ScheduledEmail)
        private seRepository: Repository<ScheduledEmail>,
    ) {}

    
    async getMailBox(userId: number): Promise<MailBox> {
        const mailBoxes = await this.mailboxService.findByUserId(userId);
        // get mailbox with the least number of scheduled emails
        let min = mailBoxes[0];
        for (let i = 1; i < mailBoxes.length; i++) {
            if (mailBoxes[i].scheduledCount < min.scheduledCount) {
                min = mailBoxes[i];
            }
        }
        return min;
    }

    scheduledEmailTs(mailbox: MailBox): number {
        const now = new Date();
        const minutes = now.getMinutes();
        const next10MinuteCeiling = Math.ceil((minutes + 1) / 10) * 10;
        now.setMinutes(next10MinuteCeiling, 0, 0); // Set minutes to the next 10-minute ceiling, seconds and milliseconds to zero
        
        // Calculate the time taken to deliver all emails
        const emailsToDeliver = mailbox.scheduledCount; // e.g., 150
        const mailsPer10Minutes = mailbox.mailsPer10Mins; // e.g., 3
        const timeTakenToDeliverAllEmails = Math.ceil(emailsToDeliver / mailsPer10Minutes) * 10 * 60 * 1000;
    
        // Calculate the end time after all emails are delivered
        const endTime = new Date(now.getTime() + timeTakenToDeliverAllEmails);
    
        // Calculate the next 10-minute ceiling after the end time
        const endMinutes = endTime.getMinutes();
        const endNext10MinuteCeiling = Math.ceil((endMinutes + 1) / 10) * 10;
        endTime.setMinutes(endNext10MinuteCeiling, 0, 0); // Set minutes to the next 10-minute ceiling, seconds and milliseconds to zero
    
        return endTime.getTime(); // Return the timestamp in milliseconds
    }
    

    async add(userId: number, outreachId: number, clientId: number): Promise<ScheduledEmail> {
        const outreach = await this.outreachService.findById(outreachId);
        if (!outreach) {
            throw new BadRequestException('Outreach not found');
        }
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const client = await this.clientService.findById(clientId);
        if (!client) {
            throw new BadRequestException('Client not found');
        }
        const se = new ScheduledEmail();
        se.userId = userId;
        se.outreach = outreach;
        se.client = client;
        se.mailbox = await this.getMailBox(userId);
        se.taskName = uuidv4();
        se.outreachStateId = 0;
        se.scheduled10minInterval = `${this.scheduledEmailTs(se.mailbox)}`;
        const response = await this.seRepository.save(se);
        se.mailbox.scheduledCount += 1;
        await this.mailboxService.update(se.mailbox);
        return response;
    }

    async findAll(): Promise<ScheduledEmail[]> {
        return await this.seRepository.find();
    }

    async findByUserId(userId: number): Promise<ScheduledEmail[]> {
        return await this.seRepository.find({ where: { userId: userId } });
    }
}
