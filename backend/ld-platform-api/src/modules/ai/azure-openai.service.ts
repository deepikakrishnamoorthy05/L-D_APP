import { Injectable, Logger } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';

export interface AzureOpenAiConfig {
  endpoint: string;
  apiKey?: string;
  deployment: string;
  apiVersion: string;
}

@Injectable()
export class AzureOpenAiService {
  private readonly logger = new Logger(AzureOpenAiService.name);
  private azureCredential?: DefaultAzureCredential;

  constructor() {
    try {
      this.azureCredential = new DefaultAzureCredential();
    } catch (err: any) {
      this.logger.warn(`DefaultAzureCredential initialization note: ${err.message}`);
    }
  }

  /**
   * Check if Azure OpenAI endpoint is configured in environment variables.
   * API Key is optional when using DefaultAzureCredential (Managed Identity / Entra ID).
   */
  isConfigured(): boolean {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;

    if (!endpoint && !resourceName) return false;
    if (endpoint && endpoint.includes('<your')) return false;

    return true;
  }

  /**
   * Retrieve structured config from environment
   */
  getConfig(): AzureOpenAiConfig {
    let endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/['"]/g, '').trim().replace(/\/$/, '');
    if (!endpoint && process.env.AZURE_OPENAI_RESOURCE_NAME) {
      const resName = (process.env.AZURE_OPENAI_RESOURCE_NAME || '').replace(/['"]/g, '').trim();
      endpoint = `https://${resName}.openai.azure.com`;
    }

    const apiKey = (process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '').replace(/['"]/g, '').trim();
    const deployment = (process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5.4').replace(/['"]/g, '').trim();
    const apiVersion = (process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview').replace(/['"]/g, '').trim();

    return { endpoint, apiKey, deployment, apiVersion };
  }

  /**
   * Get dynamic authentication headers using either API Key or DefaultAzureCredential Token
   */
  private async getAuthHeaders(apiKey?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey && !apiKey.includes('<your')) {
      this.logger.log('Authenticating Azure OpenAI using API Key');
      headers['api-key'] = apiKey;
      return headers;
    }

    this.logger.log('Authenticating Azure OpenAI using DefaultAzureCredential (Managed Identity / Azure AD token)');
    if (!this.azureCredential) {
      this.azureCredential = new DefaultAzureCredential();
    }

    const tokenResponse = await this.azureCredential.getToken('https://cognitiveservices.azure.com/.default');
    headers['Authorization'] = `Bearer ${tokenResponse.token}`;
    return headers;
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
      throw new Error('Azure OpenAI service is not configured with an endpoint URL.');
    }

    const { endpoint, apiKey, deployment, apiVersion } = this.getConfig();
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const headers = await this.getAuthHeaders(apiKey);

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

    this.logger.log(`Invoking Azure OpenAI Chat Completion at deployment: "${deployment}" [Endpoint: ${endpoint}]`);

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
