import { Injectable, NotFoundException } from '@nestjs/common';

export enum State {
    AL = 'Alabama',
    AK = 'Alaska',
    AZ = 'Arizona',
    AR = 'Arkansas',
    CA = 'California',
    CO = 'Colorado',
    CT = 'Connecticut',
    DE = 'Delaware',
    FL = 'Florida',
    GA = 'Georgia',
    HI = 'Hawaii',
    ID = 'Idaho',
    IL = 'Illinois',
    IN = 'Indiana',
    IA = 'Iowa',
    KS = 'Kansas',
    KY = 'Kentucky',
    LA = 'Louisiana',
    ME = 'Maine',
    MD = 'Maryland',
    MA = 'Massachusetts',
    MI = 'Michigan',
    MN = 'Minnesota',
    MS = 'Mississippi',
    MO = 'Missouri',
    MT = 'Montana',
    NE = 'Nebraska',
    NV = 'Nevada',
    NH = 'New Hampshire',
    NJ = 'New Jersey',
    NM = 'New Mexico',
    NY = 'New York',
    NC = 'North Carolina',
    ND = 'North Dakota',
    OH = 'Ohio',
    OK = 'Oklahoma',
    OR = 'Oregon',
    PA = 'Pennsylvania',
    RI = 'Rhode Island',
    SC = 'South Carolina',
    SD = 'South Dakota',
    TN = 'Tennessee',
    TX = 'Texas',
    UT = 'Utah',
    VT = 'Vermont',
    VA = 'Virginia',
    WA = 'Washington',
    WV = 'West Virginia',
    WI = 'Wisconsin',
    WY = 'Wyoming'
}

export enum Country {
    US = 'United States'
}

export interface PropertyAddress {
    street: string;
    unit?: string;
    city: string;
    state: State;
    zipCode: string;
    country: Country;
}

export interface PropertyFeatures {
    bedrooms: number;
    fullBathrooms: number;
    halfBathrooms: number;
    squareFeet: number;
    yearBuilt: number;
    lotSize?: number; // in square feet
    acres?: number;   // property size in acres
    parking?: {
        type: 'garage' | 'carport' | 'street' | 'none';
        spaces: number;
    };
    hasBasement?: boolean;
    stories: number;
}

export interface PropertyAmenities {
    centralAir?: boolean;
    washerDryer?: boolean;
    dishwasher?: boolean;
    pool?: boolean;
    patio?: boolean;
    fireplace?: boolean;
    furnished?: boolean;
    securitySystem?: boolean;
    outdoorKitchen?: boolean;
    smartHome?: boolean;
    solarPanels?: boolean;
    gym?: boolean;
    elevator?: boolean;
    intercom?: boolean;
    garden?: boolean;
    sprinklerSystem?: boolean;
    deckBalcony?: boolean;
    hottub?: boolean;
    hardwoodFloors?: boolean;
    storageUnit?: boolean;
    playground?: boolean;
}

export interface PropertyInformation {
    propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'apartment';
    address: PropertyAddress;
    features: PropertyFeatures;
    amenities: PropertyAmenities;
    description?: string;  // Optional property description
    zoning?: string;
    schoolDistrict?: string;
    floodZone?: boolean;
    hoaName?: string;
}

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
        if (!requiredAddressFields.every(field => property.address[field])) {
            return false;
        }

        // Features validation
        if (property.features.bedrooms <= 0 ||
            property.features.fullBathrooms < 0 ||
            property.features.halfBathrooms < 0 ||
            (property.features.fullBathrooms + property.features.halfBathrooms) === 0 ||
            property.features.squareFeet <= 0) {
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
