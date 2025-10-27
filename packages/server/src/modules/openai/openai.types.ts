import { ResponseFormatJSONSchema } from "openai/resources";

export enum OpenAIModel {
    /**
     * ❌ Does NOT support structured outputs
     * - Standard GPT-3.5 Turbo model
     * - Good for general chat/completions
     * - Cheaper than GPT-4 models
     * - 4K context window
     * - Use with function calling instead of structured outputs
     */
    GPT_3_5_TURBO = "gpt-3.5-turbo",

    /**
     * ❌ Does NOT support structured outputs
     * - GPT-3.5 with larger context window (16K tokens)
     * - Better for longer conversations or documents
     * - More expensive than standard 3.5
     * - Use with function calling instead
     */
    GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",

    /**
     * ❌ Does NOT support structured outputs
     * - Original GPT-4 model
     * - 8K context window
     * - Very capable but expensive
     * - Slower than newer models
     * - Consider using GPT-4 Turbo instead
     */
    GPT_4 = "gpt-4",

    /**
     * ✅ SUPPORTS structured outputs
     * - Latest GPT-4 Turbo with structured output support
     * - 128K context window
     * - Good for complex reasoning tasks
     * - More expensive than GPT-4o
     * - Knowledge cutoff: April 2024
     * - Recommended for complex trading analysis
     */
    GPT_4_TURBO = "gpt-4-turbo",

    /**
     * ✅ SUPPORTS structured outputs (RECOMMENDED)
     * - OpenAI's latest "omni" model
     * - Best performance-to-cost ratio
     * - 128K context window
     * - Faster than GPT-4 Turbo
     * - Knowledge cutoff: October 2023
     * - Ideal for production APIs with structured output needs
     * - BEST CHOICE for trading sentiment analysis
     */
    GPT_4O = "gpt-4o",

    /**
     * ✅ SUPPORTS structured outputs
     * - Smaller, cheaper version of GPT-4o
     * - Good for simpler tasks
     * - 128K context window
     * - Much cheaper than full models
     * - May be less accurate for complex psychology analysis
     * - Good for development/testing environments
     */
    GPT_4O_MINI = "gpt-4o-mini",

    /**
     * ❌ Does NOT support structured outputs
     * - GPT-4 with 32K context window
     * - More expensive than newer models
     * - Consider using GPT-4 Turbo instead
     * - Being phased out by OpenAI
     */
    GPT_4_32K = "gpt-4-32k",

    /**
     * ❌ Does NOT support structured outputs
     * - Specialized for vision/image analysis
     * - Not suitable for pure text trading analysis
     * - Cannot process structured output formats
     * - Use only if you need image analysis capabilities
     */
    GPT_4_VISION = "gpt-4-vision-preview",
}

// openai.tokens.ts
export const OpenAITokens = {
    CLIENT: "OPENAI_CLIENT",
    MODEL: "OPENAI_MODEL",
    TEMPERATURE: "OPENAI_TEMPERATURE",
    RETRY_CONFIG: "OPENAI_RETRY_CONFIG",
    SYSTEM_MESSAGE: "SYSTEM_MESSAGE",
    DEFAULT_CONFIG: "OPENAI_DEFAULT_CONFIG",
} as const;

/**
 * Represents possible states for OpenAI API responses
 */
export enum OpenAIResponseStatus {
    /**
     * Success - response was valid and matched expected schema
     */
    SUCCESS = "SUCCESS",

    /**
     * JSON parsing error - response was not valid JSON
     */
    INVALID_JSON = "INVALID_JSON",

    /**
     * Schema validation error - JSON was valid but didn't match expected structure
     */
    SCHEMA_VALIDATION_FAILED = "SCHEMA_VALIDATION_FAILED",

    /**
     * API error - OpenAI API returned an error
     */
    API_ERROR = "API_ERROR",

    /**
     * Unknown error occurred
     */
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Status values representing error cases (excluding SUCCESS)
 */
export type OpenAIErrorStatus = Exclude<OpenAIResponseStatus, OpenAIResponseStatus.SUCCESS>;

/**
 * Unified response type for OpenAI API operations
 */
export type OpenAIResponse<T> = OpenAISuccessResponse<T> | OpenAIErrorResponse;

/**
 * Successful API response with data
 */
export interface OpenAISuccessResponse<T> {
    status: OpenAIResponseStatus.SUCCESS;
    data: T;
    originalPrompt?: string;
    model: OpenAIModel;
    tokenUsage?: TokenUsage; // Add token usage to success responses
}

/**
 * Failed API response with error information
 */
export interface OpenAIErrorResponse {
    status: OpenAIErrorStatus;
    error: Error | string;
    originalPrompt?: string;
    model: OpenAIModel;
    tokenUsage?: TokenUsage; // Add token usage to error responses as well
}

/**
 * Token usage information from OpenAI API
 */
export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export type ToolSchemaParams = {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
};

export type ToolSchema = {
    name: string;
    description?: string;
    parameters: ToolSchemaParams;
};

export type ChatCompletionToolDefinition = {
    type: "function";
    function: ToolSchema;
};

export interface OpenAIConfigSettings {
    model: OpenAIModel;
    temperature: number;
    maxRetries: number;
    retryDelay: number;
    systemMessage: string;
    useStructuredOutput?: boolean; // Option to enable/disable structured outputs
}

// Add new type for structured output format
export type StructuredOutputFormat = {
    type: "json_schema";
    json_schema: ResponseFormatJSONSchema;
};