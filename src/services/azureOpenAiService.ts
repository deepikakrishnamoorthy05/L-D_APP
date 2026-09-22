/**
 * Azure OpenAI Frontend Service & Integration Provider
 * Connects the L&D Platform UI to Azure OpenAI / Cognitive Services / OpenAI endpoints
 * with backend proxy support and local rule-engine fallback.
 */

export interface AzureOpenAiConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

export interface CopilotAiResponse {
  answer: string;
  source: 'AZURE_OPENAI' | 'BACKEND_PROXY' | 'LOCAL_FALLBACK';
  modelUsed?: string;
  divergenceNotice?: string;
  errorDetails?: string;
}

export const azureOpenAiService = {
  /**
   * Check if Azure OpenAI credentials or endpoint are configured in Vite env variables
   */
  isConfiguredLocally: (): boolean => {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY;

    if (endpoint && !endpoint.includes('<your')) return true;
    if (key && !key.includes('<your')) return true;

    return false;
  },

  /**
   * Retrieve Vite env configuration
   */
  getConfig: (): AzureOpenAiConfig => {
    return {
      endpoint: (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '').trim().replace(/\/$/, ''),
      apiKey: (import.meta.env.VITE_AZURE_OPENAI_KEY || '').trim(),
      deployment: (import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o').trim(),
      apiVersion: (import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview').trim(),
    };
  },

  /**
   * Query Azure OpenAI completion directly from client or backend proxy
   */
  askAzureCopilot: async (
    queryText: string,
    systemPrompt?: string
  ): Promise<CopilotAiResponse> => {
    const sysPrompt =
      systemPrompt ||
      `You are the Systech L&D Skill Intelligence AI Assistant. You assist enterprise decision-makers with talent readiness, Databricks/dbt/SQL skill gap insights, and bootcamp allocations. Be accurate, concise, professional, and structured.`;

    // 1. Try Direct AI Endpoint if configured in client .env
    if (azureOpenAiService.isConfiguredLocally()) {
      try {
        const { endpoint, apiKey, deployment, apiVersion } = azureOpenAiService.getConfig();

        let url: string;
        if (endpoint.includes('/chat/completions')) {
          url = endpoint.includes('api-version') ? endpoint : `${endpoint}?api-version=${apiVersion}`;
        } else if (endpoint.includes('openai.azure.com') || endpoint.includes('cognitiveservices.azure.com')) {
          url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        } else if (endpoint) {
          url = endpoint.endsWith('/v1') ? `${endpoint}/chat/completions` : `${endpoint}/v1/chat/completions`;
        } else {
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
            { role: 'system', content: sysPrompt },
            { role: 'user', content: queryText },
          ],
          temperature: 0.7,
        };

        if (!url.includes('/deployments/')) {
          payload.model = deployment;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return {
              answer: content,
              source: 'AZURE_OPENAI',
              modelUsed: deployment,
            };
          }
        }
      } catch (err: any) {
        console.warn('Direct AI endpoint request failed, attempting backend API proxy...', err);
      }
    }

    // 2. Try Backend NestJS API Proxy
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const proxyRes = await fetch(`${backendUrl}/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, systemPrompt: sysPrompt }),
      });

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.source === 'AZURE_OPENAI' && proxyData.answer) {
          return {
            answer: proxyData.answer,
            source: 'BACKEND_PROXY',
            modelUsed: 'Azure OpenAI (via API Proxy)',
          };
        }
      }
    } catch (err) {
      console.warn('Backend AI proxy request unavailable, using local intelligence engine fallback.');
    }

    // 3. Fallback notice
    return {
      answer: '',
      source: 'LOCAL_FALLBACK',
      errorDetails: 'Azure OpenAI credentials not detected. Operating in local intelligence engine mode.',
    };
  },
};
