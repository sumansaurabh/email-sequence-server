import { State } from "src/entity/outreach.entity";


import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class OutreachDto {
    @IsNotEmpty()
    name: string;

    userId: number; // This corresponds to the foreign key reference to the User entity

    @ValidateNested({ each: true })
    @Type(() => State)
    stateList: State[];
}
