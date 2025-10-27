import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OpenAITokens } from './openai.types';
import { OpenAIClientService } from './openai-client.service';
import { OpenAIClientConfig } from './openai-client.config';

@Module({
    imports: [ConfigModule],
    providers: [
        OpenAIClientService,
        OpenAIClientConfig,
        {
            provide: OpenAITokens.CLIENT,
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get<string>('OPENAI_API_KEY');
                if (!apiKey) {
                    throw new Error('OPENAI_API_KEY is not defined in environment variables');
                }
                return new OpenAI({ apiKey });
            },
            inject: [ConfigService],
        },
    ],
    exports: [OpenAIClientService, OpenAIClientConfig],
})
export class OpenAiModule { }
