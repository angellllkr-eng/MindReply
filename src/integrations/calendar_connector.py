from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path


class CalendarConnector:
    def __init__(self, path: str | None = None) -> None:
        self.path = Path(path or os.getenv("MINDREPLY_CALENDAR_OUTBOX", "calendar-outbox.jsonl"))

    def create_followup(self, title: str, delay_minutes: int = 60, note: str = "") -> dict:
        starts_at = datetime.now(timezone.utc) + timedelta(minutes=delay_minutes)
        event = {
            "title": title,
            "starts_at": starts_at.isoformat(),
            "duration_minutes": 15,
            "note": note,
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, sort_keys=True) + "\n")
        return event
