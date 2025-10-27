// openai-client.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletion } from 'openai/resources/chat/completions';
import {
    OpenAIErrorResponse,
    OpenAIErrorStatus,
    OpenAIModel,
    OpenAIResponse,
    OpenAIResponseStatus,
    OpenAISuccessResponse,
    OpenAITokens,
    TokenUsage,
} from './openai.types';
import { OpenAIClientConfig } from './openai-client.config';
import { ZodError, ZodSchema } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

@Injectable()
export class OpenAIClientService {
    private readonly logger = new Logger(OpenAIClientService.name);

    constructor(
        @Inject(OpenAITokens.CLIENT) private readonly openai: OpenAI,
        private readonly clientConfig: OpenAIClientConfig,
    ) { }

    /**
     * Call OpenAI with structured outputs using zod schema
     */
    async executeStructuredOutput<T>(
        prompt: string,
        schema: ZodSchema<T>,
        overrideSystemMessage?: string,
        schemaName: string = 'response_schema',
    ): Promise<OpenAIResponse<T>> {
        const cfg = this.clientConfig.getConfig();
        console.log(`ai model: ${cfg.model}`);
        const systemMessage = overrideSystemMessage ?? cfg.systemMessage;

        try {
            const response = await this.callOpenAIWithStructuredOutput(
                prompt,
                systemMessage,
                schema,
                schemaName,
                cfg,
            );

            // Extract the content and parse it
            const content = response.choices[0]?.message.content;

            if (!content) {
                throw new Error('No content in response');
            }

            // Parse the response with the schema
            const data = schema.parse(JSON.parse(content));

            if (!data) {
                throw new Error('No parsed data in response');
            }

            // Extract token usage using the helper method
            const tokenUsage = this.extractTokenUsage(response);

            // Pass token usage directly to the success response builder
            return this.successResponse(data, prompt, schemaName, tokenUsage);
        } catch (err) {
            const status = this.getErrorStatus(err);
            this.logger.error(
                `Structured output call failed (${status}): ${(err as Error).message}`,
            );
            // We generally don't have token usage for error responses,
            // but could pass it if available in some situations
            return this.errorResponse(err as Error, status, prompt);
        }
    }

    getModelName(): OpenAIModel {
        return this.clientConfig.getConfig().model;
    }

    getModelVersion(): string {
        // Extract version information or return current version
        return '1.0.0'; // This would come from the actual model information
    }

    /**
     * Extract token usage information from the OpenAI API response
     *
     * @param response - Raw OpenAI API response
     * @returns Formatted token usage data or undefined if not available
     */
    private extractTokenUsage(response: ChatCompletion): TokenUsage | undefined {
        if (!response.usage) {
            return undefined;
        }

        return {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
        };
    }

    private async callOpenAIWithStructuredOutput<T>(
        prompt: string,
        systemMessage: string,
        schema: ZodSchema<T>,
        schemaName: string,
        cfg: { model: string; temperature: number },
    ): Promise<ChatCompletion> {
        const start = Date.now();

        // Create the structured response format using zod schema
        const responseFormat = zodResponseFormat(schema, schemaName);

        const response = await this.openai.chat.completions.create({
            model: cfg.model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt },
            ],
            response_format: responseFormat,
            temperature: cfg.temperature,
        });

        this.logger.debug(`Structured output API call took ${Date.now() - start}ms`);
        return response as ChatCompletion;
    }

    /**
     * Create a successful response with token usage
     *
     * @param data - The response data
     * @param prompt - Original prompt
     * @param operationName - Name of the operation (for logging)
     * @param tokenUsage - Optional token usage metrics
     * @returns Complete success response
     */
    private successResponse<T>(
        data: T,
        prompt: string,
        operationName: string,
        tokenUsage?: TokenUsage,
    ): OpenAISuccessResponse<T> {
        this.logger.debug(`Operation ${operationName} succeeded`);
        const response: OpenAISuccessResponse<T> = {
            status: OpenAIResponseStatus.SUCCESS,
            data,
            originalPrompt: prompt,
            model: this.getModelName(),
        };

        // Only add tokenUsage if it's defined
        if (tokenUsage) {
            response.tokenUsage = tokenUsage;
        }

        return response;
    }

    /**
     * Create an error response
     *
     * @param error - The error that occurred
     * @param status - Error status code
     * @param prompt - Original prompt
     * @param tokenUsage - Optional token usage metrics
     * @returns Complete error response
     */
    private errorResponse(
        error: Error,
        status: OpenAIErrorStatus,
        prompt: string,
        tokenUsage?: TokenUsage,
    ): OpenAIErrorResponse {
        const response: OpenAIErrorResponse = {
            status,
            error,
            originalPrompt: prompt,
            model: this.getModelName(),
            // tokenUsage, // Include token usage directly in the response
        };
        // Only add tokenUsage if it's defined
        if (tokenUsage) {
            response.tokenUsage = tokenUsage;
        }

        return response;
    }

    private getErrorStatus(err: unknown): OpenAIErrorStatus {
        if (err instanceof SyntaxError) return OpenAIResponseStatus.INVALID_JSON;
        if (err instanceof ZodError)
            return OpenAIResponseStatus.SCHEMA_VALIDATION_FAILED;
        if ((err as any).name === 'OpenAIError')
            return OpenAIResponseStatus.API_ERROR;
        return OpenAIResponseStatus.UNKNOWN_ERROR;
    }
}