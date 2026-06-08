from __future__ import annotations


class ReplyEngine:
    def draft(self, raw_input: str, triage: dict) -> dict:
        synthesis = triage.get("synthesis") or "The message needs a calm response."
        draft = (
            "Thank you for being direct. I understand the concern, and I want to keep this clear: "
            "the next step is to confirm the decision point, protect the relationship, and agree the timing."
        )

        return {
            "synthesis": synthesis,
            "recommended_action": {
                "kind": "reply",
                "label": "Send the prepared reply",
                "payload": {"draft": draft},
            },
        }
