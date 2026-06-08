import os
import tempfile
import unittest

from backend.audit_log import AuditLog
from backend.followup_engine import FollowUpEngine
from backend.memory_store import MemoryStore
from backend.playbook_interpreter import PlaybookInterpreter
from backend.reply_engine import ReplyEngine
from backend.risk_engine import RiskEngine
from backend.triage_engine import TriageEngine


class DecisionLayerTests(unittest.TestCase):
    def test_triage_selects_one_reply_action(self):
        result = TriageEngine().classify(
            "A client replied that the fee is too high and they need a careful response.",
            source="manual",
        )

        self.assertEqual(result["required_action"], "reply")
        self.assertIn("synthesis", result)
        self.assertNotIn("options", result)

    def test_reply_engine_returns_one_synthesis_and_one_action(self):
        triage = {
            "synthesis": "Client resistance is about price and trust.",
            "required_action": "reply",
            "pressure": "medium",
            "source": "manual",
        }

        result = ReplyEngine().draft("Client says the fee is too high.", triage)

        self.assertEqual(set(result.keys()), {"synthesis", "recommended_action"})
        self.assertEqual(result["recommended_action"]["kind"], "reply")
        self.assertNotIn("options", str(result).lower())

    def test_followup_engine_creates_single_calendar_payload(self):
        result = FollowUpEngine().schedule(
            {"synthesis": "The decision needs a quiet check-in.", "required_action": "schedule"},
            minutes_from_now=45,
        )

        self.assertEqual(result["recommended_action"]["kind"], "schedule")
        self.assertIn("starts_at", result["recommended_action"]["payload"])

    def test_risk_engine_escalates_high_risk_input(self):
        result = RiskEngine().assess(
            "Send a threat to pressure the client into paying today.",
            {"required_action": "reply"},
        )

        self.assertEqual(result["level"], "high")
        self.assertTrue(result["escalate"])

    def test_memory_store_derives_without_raw_input(self):
        store = MemoryStore()
        update = store.update(
            user_id="owner",
            raw_input="This exact private sentence must not be saved.",
            decision={"recommended_action": {"kind": "reply"}},
        )

        self.assertTrue(update["applied"])
        self.assertNotIn("This exact private sentence", str(store.export("owner")))

    def test_audit_log_writes_hash_receipt(self):
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "audit.jsonl")
            receipt = AuditLog(path).record(
                raw_input="Private client text.",
                source="manual",
                action_kind="reply",
            )

            self.assertIn("id", receipt)
            self.assertEqual(receipt["source"], "manual")
            with open(path, "r", encoding="utf-8") as handle:
                content = handle.read()
            self.assertIn("input_hash", content)
            self.assertNotIn("Private client text.", content)

    def test_playbook_interpreter_returns_one_playbook(self):
        result = PlaybookInterpreter().select("The board needs a concise update before Friday.")

        self.assertEqual(set(result.keys()), {"playbook_id", "title", "recommended_action"})
        self.assertIn(result["recommended_action"], {"reply", "schedule", "resolve", "escalate"})


if __name__ == "__main__":
    unittest.main()
