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
   * Query Azure OpenAI completion directly via NestJS API Backend Endpoint (/api/ai/copilot)
   */
  askAzureCopilot: async (
    queryText: string,
    systemPrompt?: string
  ): Promise<CopilotAiResponse> => {
    const sysPrompt =
      systemPrompt ||
      `You are the Systech L&D Skill Intelligence AI Assistant. You assist enterprise decision-makers with talent readiness, Databricks/dbt/SQL skill gap insights, and bootcamp allocations. Be accurate, concise, professional, and structured.`;

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, systemPrompt: sysPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.source === 'AZURE_OPENAI' && data.answer) {
          return {
            answer: data.answer,
            source: 'AZURE_OPENAI',
            modelUsed: 'Azure OpenAI (gpt-5.4)',
          };
        }
      }
    } catch (err) {
      console.warn('Backend AI endpoint request failed:', err);
    }

    return {
      answer: '',
      source: 'LOCAL_FALLBACK',
      errorDetails: 'Azure OpenAI backend API endpoint unavailable.',
    };
  },
};
