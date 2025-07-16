import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from "dotenv";
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as path from 'path';
import { ServeStaticMiddleware } from './common/middleware/serve-static-middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PathUtil } from './common/utility/path.utils';

// Load environment variables from the root directory
config({
    path: path.resolve(__dirname, '../../..', '.env')
});

const getClientPort = (): number => {
    return Number(process.env['CLIENT_PORT']) || 3000;
};

const getServerPort = (): number => {
    return Number(process.env['PORT']) || Number(process.env['SERVER_PORT']) || 5000;
}

async function bootstrap() {
    const SERVER_PORT = getServerPort();
    const CLIENT_PORT = getClientPort();

    console.log(`---Loading environment: SERVER_PORT=${SERVER_PORT}, CLIENT_PORT=${CLIENT_PORT}---`);

    const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

    // Configure CORS
    app.enableCors({
        origin: true, // Allow all origins in development
        credentials: true,
    });

    // Set global prefix for all routes
    app.setGlobalPrefix("api");

    // Serve the static files from the React app
    app.useStaticAssets(PathUtil.getStaticAssetsPath());

    // Apply the ServeStaticMiddleware
    app.use(new ServeStaticMiddleware().use);


    // Apply global interceptors and filters
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    // Apply global validation pipe with transformation options
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Remove properties that are not defined in the DTO
            forbidNonWhitelisted: true, // Throw error if unknown properties are present
            transform: true, // Automatically transform payloads to DTO instances
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Start the server - THIS WAS MISSING!
    await app.listen(SERVER_PORT);

    console.log(`Server running on http://localhost:${SERVER_PORT}`);
    console.log(`API available at http://localhost:${SERVER_PORT}/api`);
}

bootstrap().catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});