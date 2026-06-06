type AzureChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AzureChatInput = {
  messages: AzureChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AIProviderSource = "azure-openai" | "openai" | "anthropic" | "openrouter" | "groq" | "blackbox";

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
    process.env.AZURE_OPENAI_DEPLOYMENT &&
    process.env.AZURE_OPENAI_API_VERSION,
  );
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isBlackboxConfigured() {
  return Boolean(process.env.BLACKBOX_API_KEY?.trim() && process.env.BLACKBOX_CHAT_ENDPOINT?.trim());
}

export function isAIProviderConfigured() {
  return isAzureOpenAIConfigured()
    || isOpenAIConfigured()
    || isAnthropicConfigured()
    || isOpenRouterConfigured()
    || isGroqConfigured()
    || isBlackboxConfigured();
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

export async function runOpenAIChatCompletion(input: AzureChatInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.35,
      max_tokens: input.maxTokens ?? 450,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`);
  }

  const data = await response.json() as AzureChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}

async function runOpenAICompatibleChatCompletion(input: AzureChatInput, options: {
  apiKey: string;
  endpoint: string;
  model: string;
  referer?: string;
  title?: string;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${options.apiKey}`,
  };

  if (options.referer) headers["HTTP-Referer"] = options.referer;
  if (options.title) headers["X-Title"] = options.title;

  const response = await fetch(options.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.model,
      temperature: input.temperature ?? 0.35,
      max_tokens: input.maxTokens ?? 450,
      messages: input.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with ${response.status}`);
  }

  const data = await response.json() as AzureChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}

export async function runAnthropicChatCompletion(input: AzureChatInput) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";

  if (!apiKey) return null;

  const system = input.messages.find((message) => message.role === "system")?.content ?? "";
  const messages = input.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system,
      messages,
      temperature: input.temperature ?? 0.35,
      max_tokens: input.maxTokens ?? 450,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with ${response.status}`);
  }

  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const content = data.content?.find((part) => part.type === "text" && part.text)?.text?.trim();
  return content || null;
}

export function runOpenRouterChatCompletion(input: AzureChatInput) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  return runOpenAICompatibleChatCompletion(input, {
    apiKey,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
    referer: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mind-reply.com",
    title: "MindReply",
  });
}

export function runGroqChatCompletion(input: AzureChatInput) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  return runOpenAICompatibleChatCompletion(input, {
    apiKey,
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
  });
}

export function runBlackboxChatCompletion(input: AzureChatInput) {
  const apiKey = process.env.BLACKBOX_API_KEY;
  const endpoint = process.env.BLACKBOX_CHAT_ENDPOINT;
  if (!apiKey || !endpoint) return null;

  return runOpenAICompatibleChatCompletion(input, {
    apiKey,
    endpoint,
    model: process.env.BLACKBOX_MODEL ?? "blackboxai/blackbox-pro",
  });
}

export async function runConfiguredChatCompletion(input: AzureChatInput) {
  if (isAzureOpenAIConfigured()) {
    const content = await runAzureChatCompletion(input);
    return content ? { content, source: "azure-openai" as const } : null;
  }

  if (isOpenAIConfigured()) {
    const content = await runOpenAIChatCompletion(input);
    return content ? { content, source: "openai" as const } : null;
  }

  if (isAnthropicConfigured()) {
    const content = await runAnthropicChatCompletion(input);
    return content ? { content, source: "anthropic" as const } : null;
  }

  if (isOpenRouterConfigured()) {
    const content = await runOpenRouterChatCompletion(input);
    return content ? { content, source: "openrouter" as const } : null;
  }

  if (isGroqConfigured()) {
    const content = await runGroqChatCompletion(input);
    return content ? { content, source: "groq" as const } : null;
  }

  if (isBlackboxConfigured()) {
    const content = await runBlackboxChatCompletion(input);
    return content ? { content, source: "blackbox" as const } : null;
  }

  return null;
}
