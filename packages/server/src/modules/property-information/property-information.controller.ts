import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PropertyInformationService, PropertyInformation } from './property-information.service';

@Controller('property-information')
export class PropertyInformationController {
    constructor(private readonly propertyInformationService: PropertyInformationService) { }

    @Get(':id')
    async getProperty(@Param('id') id: string) {
        return await this.propertyInformationService.getPropertyById(id);
    }

    @Post()
    async createProperty(@Body() propertyData: PropertyInformation) {
        return await this.propertyInformationService.createNewProperty(propertyData);
    }
}
