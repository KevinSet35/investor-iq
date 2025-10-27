import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PropertyInformationService } from './property-information.service';
import { PropertyInformation } from './property-information.interface';

@Controller('property-information')
export class PropertyInformationController {
    constructor(private readonly propertyInformationService: PropertyInformationService) { }

    @Get(':id')
    async getProperty(@Param('id') id: string): Promise<PropertyInformation> {
        return await this.propertyInformationService.getPropertyById(id);
    }

    @Post()
    async createProperty(@Body() propertyData: PropertyInformation): Promise<PropertyInformation> {
        return await this.propertyInformationService.createNewProperty(propertyData);
    }
}
