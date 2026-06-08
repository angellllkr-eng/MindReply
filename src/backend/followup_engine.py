from __future__ import annotations

from datetime import datetime, timedelta, timezone


class FollowUpEngine:
    def schedule(self, triage: dict, minutes_from_now: int = 60) -> dict:
        starts_at = datetime.now(timezone.utc) + timedelta(minutes=minutes_from_now)

        return {
            "synthesis": triage.get("synthesis") or "The matter needs a timed follow-up.",
            "recommended_action": {
                "kind": "schedule",
                "label": "Set the follow-up",
                "payload": {
                    "title": "MindReply follow-up",
                    "starts_at": starts_at.isoformat(),
                    "duration_minutes": 15,
                },
            },
        }
