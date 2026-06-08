# MRagent Mind Read Design

## Intent

MRagent is the gentle showcase surface for MindReply. It should feel warm, confident, and quietly personal while staying inside the product rule: one reflection, one calmer move, one recommended action.

## Experience

The first-use promise is: one private decision is free. The user pastes pressure, wording, hesitation, or conflict. MRagent returns a Mind Read that makes the user feel understood without becoming therapy, dependency, or generic conversation.

## Output Contract

Every MRagent response must include:

- what this is really about
- what the user's mindset is protecting
- the calmer move
- one recommended action
- risk status
- quiet receipt

The response must not provide multiple paths, expose hidden reasoning, or add a large workspace around a simple decision.

## Product Surfaces

- `/`: premium homepage showcase with the free Mind Read intake.
- `/agent`: fuller MRagent session surface for direct testing and demos.
- `/api/intake`: deterministic decision response.
- `/api/agent`: MRagent response endpoint with provider-backed generation when configured and deterministic fallback when not configured.

## Tone Rules

MRagent should be:

- gentle
- confident
- emotionally precise
- concise
- private by default
- non-therapy
- action-oriented

MRagent should avoid:

- generic assistant framing
- therapy claims
- dependency language
- multiple choices
- busy dashboards
- provider or staffing claims

## Implementation Notes

The deterministic decision layer owns the core Mind Read fields so the showcase works without a provider key. Provider-backed text may improve warmth and flow, but it must preserve the same structure and recommended action.

Raw input should not be persisted in this pass. Receipts stay privacy-safe and action-oriented.
