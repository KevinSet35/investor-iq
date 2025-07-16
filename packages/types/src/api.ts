export enum ResponseStatus {
    SUCCESS = "success",
    ERROR = "error",
}

export interface ApiResponse<T = null> {
    status: ResponseStatus;
    payload?: T;
    error?: {
        code: number;
        message: string;
        details?: string;
    };
    meta: {
        timestamp: string;
        path: string;
        method: string | undefined;
    };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface HealthCheckResponse {
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    uptime: number;
}
