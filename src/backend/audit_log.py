from __future__ import annotations

import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from pathlib import Path


class AuditLog:
    def __init__(self, path: str = "audit.jsonl") -> None:
        self.path = Path(path)

    def record(
        self,
        raw_input: str,
        source: str,
        action_kind: str,
        risk_level: str = "low",
        playbook_id: str = "unassigned",
        confidence: float | None = None,
    ) -> dict:
        timestamp = datetime.now(timezone.utc).isoformat()
        input_hash = hashlib.sha256(raw_input.encode("utf-8")).hexdigest()
        receipt = {
            "id": input_hash[:16],
            "timestamp": timestamp,
            "source": source,
            "action_kind": action_kind,
            "risk_level": risk_level,
            "playbook_id": playbook_id,
            "confidence": confidence,
            "input_hash": input_hash,
            "raw_content_redacted": True,
        }
        receipt["signature"] = self._signature(receipt)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(receipt, sort_keys=True) + "\n")
        return {
            "id": receipt["id"],
            "timestamp": timestamp,
            "source": source,
            "signature": receipt["signature"],
        }

    def _signature(self, receipt: dict) -> str:
        key = os.getenv("MINDREPLY_RECEIPT_SIGNING_KEY", "mindreply-local-receipt-key")
        payload = json.dumps(
            {key_name: value for key_name, value in receipt.items() if key_name != "signature"},
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
        return hmac.new(key.encode("utf-8"), payload, hashlib.sha256).hexdigest()
