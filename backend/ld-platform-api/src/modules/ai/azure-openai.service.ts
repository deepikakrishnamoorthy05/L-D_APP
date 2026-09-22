import { Injectable, Logger } from '@nestjs/common';

export interface AzureOpenAiConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

@Injectable()
export class AzureOpenAiService {
  private readonly logger = new Logger(AzureOpenAiService.name);

  /**
   * Check if Azure OpenAI credentials are set in environment variables
   */
  isConfigured(): boolean {
    const key = process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    if (!key || !endpoint) return false;
    if (key.includes('<your') || endpoint.includes('<your')) return false;

    return true;
  }

  /**
   * Retrieve structured config from environment
   */
  getConfig(): AzureOpenAiConfig {
    const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
    const apiKey = process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '';
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    return { endpoint, apiKey, deployment, apiVersion };
  }

  /**
   * Execute chat completion against Azure OpenAI deployment endpoint
   */
  async getCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; jsonMode?: boolean }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Azure OpenAI service is not configured with valid credentials.');
    }

    const { endpoint, apiKey, deployment, apiVersion } = this.getConfig();
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    };

    const payload: any = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.7,
    };

    if (options?.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    this.logger.log(`Invoking Azure OpenAI Chat Completion at deployment: "${deployment}"`);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      this.logger.error(`Azure OpenAI request failed [${res.status}]: ${errorText}`);
      throw new Error(`Azure OpenAI returned status ${res.status}: ${errorText || res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Azure OpenAI returned empty response payload.');
    }

    return content;
  }
}
