from __future__ import annotations


class RiskEngine:
    HIGH_RISK_TERMS = {
        "threat",
        "force",
        "blackmail",
        "harass",
        "illegal",
        "self-harm",
        "suicide",
        "regulator",
        "lawsuit",
    }

    MEDIUM_RISK_TERMS = {"complaint", "refund", "termination", "medical", "legal", "fire"}

    def assess(self, raw_input: str, triage: dict | None = None) -> dict:
        lower = raw_input.lower()
        if any(term in lower for term in self.HIGH_RISK_TERMS):
            return {
                "level": "high",
                "reason": "Risk detected before communication.",
                "escalate": True,
            }
        if any(term in lower for term in self.MEDIUM_RISK_TERMS):
            return {
                "level": "medium",
                "reason": "Sensitive context detected; proceed with restraint.",
                "escalate": False,
            }
        return {
            "level": "low",
            "reason": "No blocking risk detected.",
            "escalate": False,
        }
