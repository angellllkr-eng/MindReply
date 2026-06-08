from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TriageResult:
    synthesis: str
    required_action: str
    urgency: str
    pressure: str
    source: str
    confidence: float

    def to_dict(self) -> dict:
        return {
            "synthesis": self.synthesis,
            "required_action": self.required_action,
            "urgency": self.urgency,
            "pressure": self.pressure,
            "source": self.source,
            "confidence": self.confidence,
        }


class TriageEngine:
    def classify(self, raw_input: str, source: str = "manual") -> dict:
        text = " ".join(raw_input.split()).strip()
        lower = text.lower()

        action = "resolve"
        if any(word in lower for word in ["threat", "force", "unsafe", "legal", "regulator", "complaint"]):
            action = "escalate"
        elif any(word in lower for word in ["reply", "client", "email", "message", "fee", "price", "response"]):
            action = "reply"
        elif any(word in lower for word in ["follow up", "check in", "tomorrow", "next week", "calendar"]):
            action = "schedule"

        urgency = "high" if any(word in lower for word in ["today", "urgent", "immediately", "deadline"]) else "normal"
        pressure = "high" if action == "escalate" else "medium" if urgency == "high" else "low"
        synthesis = self._synthesis(text, action)

        return TriageResult(
            synthesis=synthesis,
            required_action=action,
            urgency=urgency,
            pressure=pressure,
            source=source,
            confidence=0.82,
        ).to_dict()

    def _synthesis(self, text: str, action: str) -> str:
        if not text:
            return "No usable input was provided."
        if action == "escalate":
            return "The input carries risk and needs review before anything is sent."
        if action == "reply":
            return "The input needs a calm response that reduces pressure and keeps the relationship intact."
        if action == "schedule":
            return "The input needs a quiet follow-up moment rather than more wording now."
        return "The input can be closed with a clear record and no extra movement."
