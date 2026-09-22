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
   * Check if Azure OpenAI or OpenAI credentials/endpoint are configured
   */
  isConfigured(): boolean {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_API_BASE;
    const key = process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY;

    if (endpoint && !endpoint.includes('<your')) return true;
    if (key && !key.includes('<your')) return true;

    return false;
  }

  /**
   * Retrieve structured config from environment
   */
  getConfig(): AzureOpenAiConfig {
    const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_API_BASE || '').trim().replace(/\/$/, '');
    const apiKey = (process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '').trim();
    const deployment = (process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.OPENAI_MODEL || 'gpt-4o').trim();
    const apiVersion = (process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview').trim();

    return { endpoint, apiKey, deployment, apiVersion };
  }

  /**
   * Execute chat completion against Azure OpenAI or OpenAI API endpoint
   */
  async getCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; jsonMode?: boolean }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Azure OpenAI service is not configured with valid endpoint or API credentials.');
    }

    const { endpoint, apiKey, deployment, apiVersion } = this.getConfig();

    let url: string;
    if (endpoint.includes('/chat/completions')) {
      // Full target URL provided directly
      url = endpoint.includes('api-version') ? endpoint : `${endpoint}?api-version=${apiVersion}`;
    } else if (endpoint.includes('openai.azure.com') || endpoint.includes('cognitiveservices.azure.com')) {
      // Azure OpenAI or Azure Cognitive Services resource URL
      url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    } else if (endpoint) {
      // Custom AI proxy or standard OpenAI base URL
      url = endpoint.endsWith('/v1') ? `${endpoint}/chat/completions` : `${endpoint}/v1/chat/completions`;
    } else {
      // Default OpenAI REST API endpoint
      url = `https://api.openai.com/v1/chat/completions`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['api-key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const payload: any = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.7,
    };

    if (!url.includes('/deployments/')) {
      payload.model = deployment;
    }

    if (options?.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    this.logger.log(`Invoking AI Chat Completion at endpoint: "${url}" (Deployment/Model: "${deployment}")`);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      this.logger.error(`AI API request failed [${res.status}]: ${errorText}`);
      throw new Error(`AI API returned status ${res.status}: ${errorText || res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI API returned empty response payload.');
    }

    return content;
  }
}
