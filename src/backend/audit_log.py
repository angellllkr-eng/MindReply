from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


class AuditLog:
    def __init__(self, path: str = "audit.jsonl") -> None:
        self.path = Path(path)

    def record(self, raw_input: str, source: str, action_kind: str) -> dict:
        timestamp = datetime.now(timezone.utc).isoformat()
        input_hash = hashlib.sha256(raw_input.encode("utf-8")).hexdigest()
        receipt = {
            "id": input_hash[:16],
            "timestamp": timestamp,
            "source": source,
            "action_kind": action_kind,
            "input_hash": input_hash,
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(receipt, sort_keys=True) + "\n")
        return {
            "id": receipt["id"],
            "timestamp": timestamp,
            "source": source,
        }
