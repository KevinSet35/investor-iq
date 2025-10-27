export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}

export interface FilterOptions {
    [key: string]: string | number | boolean | undefined;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface QueryOptions {
    sort?: SortOptions;
    filter?: FilterOptions;
    pagination?: PaginationOptions;
}

export type DatabaseConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface SystemHealth {
    database: DatabaseConnectionStatus;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    uptime: number;
}
