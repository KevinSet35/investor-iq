import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAddress, PropertyInformation } from './property-information.interface';

@Injectable()
export class PropertyInformationService {
    private mockProperties: Map<string, PropertyInformation> = new Map();

    async getPropertyById(id: string): Promise<PropertyInformation> {
        const property = this.mockProperties.get(id);
        if (!property) {
            throw new NotFoundException('Property not found');
        }
        return property;
    }

    async createNewProperty(propertyData: PropertyInformation): Promise<PropertyInformation> {
        if (!this.validatePropertyInformation(propertyData)) {
            throw new Error('Invalid property information');
        }

        let counter = 0;
        let id: string;
        do {
            id = Math.random().toString(36).substring(7);
            counter++;
        } while (this.mockProperties.has(id) && counter < 5);
        if (this.mockProperties.has(id)) {
            throw new Error('Failed to generate unique property ID');
        }
        this.mockProperties.set(id, propertyData);
        return { ...propertyData };
    }

    private validatePropertyInformation(property: PropertyInformation): boolean {
        // Basic validation
        if (!property.address || !property.features) {
            return false;
        }

        // Address validation
        const requiredAddressFields: (keyof PropertyAddress)[] = ['street', 'city', 'state', 'zipCode', 'country'];
        if (!requiredAddressFields.every((field) => property.address[field])) {
            return false;
        }

        // Features validation
        if (
            property.features.bedrooms <= 0 ||
            property.features.fullBathrooms < 0 ||
            property.features.halfBathrooms < 0 ||
            property.features.fullBathrooms + property.features.halfBathrooms === 0 ||
            property.features.squareFeet <= 0
        ) {
            return false;
        }

        return true;
    }

    // calculatePricePerSquareFoot(price: number, property: PropertyInformation): number {
    //     if (price <= 0 || !property.features.squareFeet) {
    //         return 0;
    //     }
    //     return Math.round((price / property.features.squareFeet) * 100) / 100;
    // }

    // isMultiUnit(property: PropertyInformation): boolean {
    //     return property.propertyType === 'multi_family' || property.propertyType === 'apartment';
    // }
}
