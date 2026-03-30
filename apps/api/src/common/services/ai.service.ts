import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI } from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: AzureOpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private initClient(): void {
    const apiKey = this.configService.get<string>('ai.azureOpenAiApiKey');
    const endpoint = this.configService.get<string>('ai.azureOpenAiEndpoint');

    if (apiKey && endpoint) {
      this.client = new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion:
          this.configService.get<string>('ai.azureOpenAiApiVersion') ||
          '2024-12-01-preview',
      });
      this.logger.log('Azure OpenAI client initialized');
    } else {
      this.logger.warn(
        'Azure OpenAI not configured - AI features will use mock responses',
      );
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async chatCompletion(
    systemPrompt: string,
    userMessage: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Azure OpenAI client is not configured');
    }

    const deployment =
      this.configService.get<string>('ai.azureOpenAiDeploymentName') ||
      'gpt-4o';
    const maxTokens =
      options?.maxTokens ||
      this.configService.get<number>('ai.maxTokens') ||
      4096;

    const response = await this.client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: options?.temperature ?? 0.3,
    });

    return response.choices[0]?.message?.content || '';
  }

  async chatCompletionJson<T>(
    systemPrompt: string,
    userMessage: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<T> {
    const rawResponse = await this.chatCompletion(
      systemPrompt +
        '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanatory text.',
      userMessage,
      options,
    );

    // Strip markdown fences if present
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleaned) as T;
  }
}
