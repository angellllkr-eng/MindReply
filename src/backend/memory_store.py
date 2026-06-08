from __future__ import annotations


class MemoryStore:
    def __init__(self) -> None:
        self._records: dict[str, list[dict]] = {}

    def update(self, user_id: str, raw_input: str, decision: dict) -> dict:
        action = decision.get("recommended_action", {}).get("kind", "resolve")
        derived = {
            "preferred_action": action,
            "tone": "calm",
            "last_signal_length": len(raw_input),
        }
        self._records.setdefault(user_id, []).append(derived)
        return {
            "applied": True,
            "summary": "Decision memory adjusted quietly.",
        }

    def export(self, user_id: str) -> list[dict]:
        return list(self._records.get(user_id, []))
