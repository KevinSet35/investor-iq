import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIConfigSettings, OpenAIModel } from './openai.types';

// Grouped defaults with clear naming
const OPENAI_DEFAULTS = {
    MODEL: OpenAIModel.GPT_4O,
    TEMPERATURE: 0.7,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    SYSTEM_MESSAGE: 'You are a helpful AI assistant.',
    USE_STRUCTURED_OUTPUT: true,
} as const;

// Models that support structured output
const STRUCTURED_OUTPUT_MODELS = [
    OpenAIModel.GPT_4_TURBO,
    OpenAIModel.GPT_4O,
    OpenAIModel.GPT_4O_MINI,
] as OpenAIModel[];

@Injectable()
export class OpenAIClientConfig {
    private readonly settings: OpenAIConfigSettings;

    constructor(private readonly configService: ConfigService) {
        this.settings = this.initializeSettings();
    }

    private initializeSettings(): OpenAIConfigSettings {
        return {
            model: this.getConfigValue('OPENAI_MODEL', OPENAI_DEFAULTS.MODEL),
            temperature: this.getConfigValue('OPENAI_TEMPERATURE', OPENAI_DEFAULTS.TEMPERATURE),
            maxRetries: this.getConfigValue('OPENAI_MAX_RETRIES', OPENAI_DEFAULTS.MAX_RETRIES),
            retryDelay: this.getConfigValue('OPENAI_RETRY_DELAY', OPENAI_DEFAULTS.RETRY_DELAY),
            systemMessage: this.getConfigValue('OPENAI_SYSTEM_MESSAGE', OPENAI_DEFAULTS.SYSTEM_MESSAGE),
            useStructuredOutput: this.getConfigValue('OPENAI_USE_STRUCTURED_OUTPUT', OPENAI_DEFAULTS.USE_STRUCTURED_OUTPUT),
        };
    }

    private getConfigValue<T>(key: string, defaultValue: T): T {
        return this.configService.get<T>(key, defaultValue);
    }

    getConfig(): OpenAIConfigSettings {
        return this.settings;
    }

    getModel(): OpenAIModel {
        return this.settings.model;
    }

    getTemperature(): number {
        return this.settings.temperature;
    }

    getSystemMessage(): string {
        return this.settings.systemMessage;
    }

    supportsStructuredOutput(): boolean {
        return STRUCTURED_OUTPUT_MODELS.includes(this.getModel());
    }
}