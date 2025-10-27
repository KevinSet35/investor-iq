import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse, ResponseStatus } from '@investor-iq/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();

        return next.handle().pipe(
            map((payload) => {
                // Explicitly type the object to force strict checking
                const result: ApiResponse<T> = {
                    status: ResponseStatus.SUCCESS,
                    payload,
                    meta: {
                        timestamp: new Date().toISOString(),
                        path: request.url,
                        method: request.method,
                    },
                };
                return result;
            }),
        );
    }
}
