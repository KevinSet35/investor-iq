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
    WY = 'Wyoming',
}

export enum Country {
    US = 'United States',
}
export interface PropertyAddress {
    street: string;
    unit?: string;
    city: string;
    state: State;
    zipCode: string;
    country: Country;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
    subdivision?: string;
    county?: string;
}

export interface PropertyFeatures {
    bedrooms: number;
    fullBathrooms: number;
    halfBathrooms: number;
    squareFeet: number;
    yearBuilt: number;
    lotSize?: number; // in square feet
    acres?: number;
    stories: number;
    propertyCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_renovation';
    foundationType?: 'slab' | 'crawl_space' | 'basement' | 'pier_and_beam';
    roofType?: 'asphalt_shingle' | 'tile' | 'metal' | 'flat' | 'other';
    exteriorMaterial?: 'brick' | 'wood' | 'vinyl' | 'stucco' | 'stone' | 'other';
    heatingType?: 'forced_air' | 'radiant' | 'heat_pump' | 'baseboard' | 'none';
    coolingType?: 'central' | 'evaporative' | 'window_units' | 'none';
    waterSource?: 'public' | 'well';
    sewerType?: 'public' | 'septic';
    energyEfficiencyRating?: number; // e.g. Energy Star / HERS index
    lastRenovationYear?: number;
    parking?: {
        type: 'garage' | 'carport' | 'street' | 'driveway' | 'none';
        spaces: number;
        hasEvCharger?: boolean;
    };
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
    gatedCommunity?: boolean;
    clubhouse?: boolean;
    businessCenter?: boolean;
    concierge?: boolean;
    rooftopAccess?: boolean;
}


export interface PropertyInformation {
    propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'apartment';
    address: PropertyAddress;
    features: PropertyFeatures;
    amenities: PropertyAmenities;
    description?: string; // Optional property description
    zoning?: string;
    schoolDistrict?: string;
    floodZone?: boolean;
    hoaName?: string;
    mlsId?: string;
}