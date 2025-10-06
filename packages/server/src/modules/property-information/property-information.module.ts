import { Module } from '@nestjs/common';
import { PropertyInformationController } from './property-information.controller';
import { PropertyInformationService } from './property-information.service';

@Module({
    controllers: [PropertyInformationController],
    providers: [PropertyInformationService],
})
export class PropertyInformationModule { }
