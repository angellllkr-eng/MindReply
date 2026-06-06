import assert from "node:assert/strict";
import { productionRequirements } from "../lib/production-requirements";
import {
  isAnthropicConfigured,
  isBlackboxConfigured,
  isGroqConfigured,
  isOpenAIConfigured,
  isOpenRouterConfigured,
} from "../lib/azure-openai";

const aiRequirement = productionRequirements.find((item) => item.healthCheck === "azureOpenAI");
assert.ok(aiRequirement);
assert.match(aiRequirement.service, /AI Provider/i);
assert.deepEqual(aiRequirement.alternativeKeyGroups, [
  ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_DEPLOYMENT", "AZURE_OPENAI_API_VERSION"],
  ["OPENAI_API_KEY"],
  ["ANTHROPIC_API_KEY"],
  ["OPENROUTER_API_KEY"],
  ["GROQ_API_KEY"],
  ["BLACKBOX_API_KEY", "BLACKBOX_CHAT_ENDPOINT"],
]);

const originalOpenAIKey = process.env.OPENAI_API_KEY;
const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
const originalGroqKey = process.env.GROQ_API_KEY;
const originalBlackboxKey = process.env.BLACKBOX_API_KEY;
const originalBlackboxEndpoint = process.env.BLACKBOX_CHAT_ENDPOINT;

delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.OPENROUTER_API_KEY;
delete process.env.GROQ_API_KEY;
delete process.env.BLACKBOX_API_KEY;
delete process.env.BLACKBOX_CHAT_ENDPOINT;

assert.equal(isOpenAIConfigured(), false);
assert.equal(isAnthropicConfigured(), false);
assert.equal(isOpenRouterConfigured(), false);
assert.equal(isGroqConfigured(), false);
assert.equal(isBlackboxConfigured(), false);

process.env.OPENAI_API_KEY = "test-openai-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.OPENROUTER_API_KEY = "test-openrouter-key";
process.env.GROQ_API_KEY = "test-groq-key";
process.env.BLACKBOX_API_KEY = "test-blackbox-key";
process.env.BLACKBOX_CHAT_ENDPOINT = "https://example.test/chat";

assert.equal(isOpenAIConfigured(), true);
assert.equal(isAnthropicConfigured(), true);
assert.equal(isOpenRouterConfigured(), true);
assert.equal(isGroqConfigured(), true);
assert.equal(isBlackboxConfigured(), true);

if (originalOpenAIKey === undefined) {
  delete process.env.OPENAI_API_KEY;
} else {
  process.env.OPENAI_API_KEY = originalOpenAIKey;
}
if (originalAnthropicKey === undefined) delete process.env.ANTHROPIC_API_KEY;
else process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
if (originalOpenRouterKey === undefined) delete process.env.OPENROUTER_API_KEY;
else process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
else process.env.GROQ_API_KEY = originalGroqKey;
if (originalBlackboxKey === undefined) delete process.env.BLACKBOX_API_KEY;
else process.env.BLACKBOX_API_KEY = originalBlackboxKey;
if (originalBlackboxEndpoint === undefined) delete process.env.BLACKBOX_CHAT_ENDPOINT;
else process.env.BLACKBOX_CHAT_ENDPOINT = originalBlackboxEndpoint;

console.log("AI provider checks passed.");

export {};
