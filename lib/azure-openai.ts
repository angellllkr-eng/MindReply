type AzureChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AzureChatInput = {
  messages: AzureChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

type AzureChatChoice = {
  message?: {
    content?: string;
  };
};

type AzureChatResponse = {
  choices?: AzureChatChoice[];
};

export function isAzureOpenAIConfigured() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_DEPLOYMENT,
  );
}

export async function runAzureChatCompletion(input: AzureChatInput) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-02-15-preview";

  if (!endpoint || !apiKey || !deployment) return null;

  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      temperature: input.temperature ?? 0.35,
      max_tokens: input.maxTokens ?? 450,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI request failed with ${response.status}`);
  }

  const data = await response.json() as AzureChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}
