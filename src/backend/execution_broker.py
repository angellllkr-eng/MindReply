from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .audit_log import AuditLog


@dataclass(frozen=True)
class BrokerResult:
    status: str
    action_kind: str
    receipt: dict
    executed: bool
    reason: str

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "action_kind": self.action_kind,
            "receipt": self.receipt,
            "executed": self.executed,
            "reason": self.reason,
        }


class ExecutionBroker:
    """Single choke point for executing recommended actions.

    The broker keeps the platform rule explicit: high-risk actions do not execute
    automatically, and every accepted action produces a privacy-safe receipt.
    """

    def __init__(self, audit_log: AuditLog | None = None) -> None:
        self.audit_log = audit_log or AuditLog()
        self._handlers: dict[str, Callable[[dict], dict]] = {}

    def register_handler(self, action_kind: str, handler: Callable[[dict], dict]) -> None:
        self._handlers[action_kind] = handler

    def execute(
        self,
        *,
        raw_input: str,
        source: str,
        decision: dict,
        risk: dict,
        playbook: dict | None = None,
    ) -> dict:
        action = decision.get("recommended_action", {})
        action_kind = str(action.get("kind") or "resolve")
        playbook_id = str((playbook or {}).get("playbook_id") or "unassigned")

        receipt = self.audit_log.record(
            raw_input=raw_input,
            source=source,
            action_kind=action_kind,
            risk_level=str(risk.get("level", "low")),
            playbook_id=playbook_id,
            confidence=decision.get("confidence"),
        )

        if risk.get("escalate") or risk.get("level") == "high" or action_kind == "escalate":
            return BrokerResult(
                status="review_required",
                action_kind=action_kind,
                receipt=receipt,
                executed=False,
                reason="Risk gate blocked automatic execution.",
            ).to_dict()

        handler = self._handlers.get(action_kind)
        if handler:
            handler(action)

        return BrokerResult(
            status="ready",
            action_kind=action_kind,
            receipt=receipt,
            executed=bool(handler),
            reason="Action cleared the risk gate.",
        ).to_dict()
