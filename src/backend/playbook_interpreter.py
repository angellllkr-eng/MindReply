from __future__ import annotations


class PlaybookInterpreter:
    def select(self, raw_input: str) -> dict:
        lower = raw_input.lower()
        if any(word in lower for word in ["board", "investor", "executive"]):
            return {
                "playbook_id": "executive-brief",
                "title": "Executive brief",
                "recommended_action": "reply",
            }
        if any(word in lower for word in ["follow", "calendar", "later"]):
            return {
                "playbook_id": "quiet-follow-up",
                "title": "Quiet follow-up",
                "recommended_action": "schedule",
            }
        if any(word in lower for word in ["threat", "legal", "regulator"]):
            return {
                "playbook_id": "risk-review",
                "title": "Risk review",
                "recommended_action": "escalate",
            }
        return {
            "playbook_id": "clear-next-move",
            "title": "Clear next move",
            "recommended_action": "resolve",
        }
