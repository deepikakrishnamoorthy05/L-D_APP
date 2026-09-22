/**
 * Azure OpenAI Frontend Service & Integration Provider
 * Connects the L&D Platform UI to Azure OpenAI deployments (e.g., gpt-4o)
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
   * Check if Azure OpenAI credentials are configured in Vite env variables
   */
  isConfiguredLocally: (): boolean => {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY;

    if (!endpoint || !key) return false;
    if (endpoint.includes('<your') || key.includes('<your')) return false;

    return true;
  },

  /**
   * Retrieve Vite env configuration
   */
  getConfig: (): AzureOpenAiConfig => {
    return {
      endpoint: (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, ''),
      apiKey: import.meta.env.VITE_AZURE_OPENAI_KEY || '',
      deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
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

    // 1. Try Direct Azure OpenAI if configured in client .env
    if (azureOpenAiService.isConfiguredLocally()) {
      try {
        const { endpoint, apiKey, deployment, apiVersion } = azureOpenAiService.getConfig();
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: queryText },
            ],
            temperature: 0.7,
          }),
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
        console.warn('Direct Azure OpenAI request failed, attempting backend API proxy...', err);
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
