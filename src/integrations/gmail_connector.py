from __future__ import annotations

import email
import imaplib
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class IntakeCandidate:
    source: str
    subject: str
    sender: str
    body: str


class GmailConnector:
    def __init__(self) -> None:
        self.host = os.getenv("MINDREPLY_IMAP_HOST", "imap.gmail.com")
        self.user = os.getenv("MINDREPLY_IMAP_USER", "")
        self.password = os.getenv("MINDREPLY_IMAP_PASSWORD", "")

    def configured(self) -> bool:
        return bool(self.user and self.password)

    def fetch_latest(self, mailbox: str = "INBOX", limit: int = 5) -> list[IntakeCandidate]:
        if not self.configured():
            return []

        with imaplib.IMAP4_SSL(self.host) as client:
            client.login(self.user, self.password)
            client.select(mailbox)
            _, data = client.search(None, "ALL")
            message_ids = data[0].split()[-limit:]
            candidates: list[IntakeCandidate] = []

            for message_id in reversed(message_ids):
                _, message_data = client.fetch(message_id, "(RFC822)")
                raw = message_data[0][1]
                parsed = email.message_from_bytes(raw)
                candidates.append(
                    IntakeCandidate(
                        source="gmail",
                        subject=str(parsed.get("subject", "")),
                        sender=str(parsed.get("from", "")),
                        body=self._plain_body(parsed),
                    )
                )
            return candidates

    def _plain_body(self, message: email.message.Message) -> str:
        if message.is_multipart():
            for part in message.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        return payload.decode(part.get_content_charset() or "utf-8", errors="replace")
            return ""
        payload = message.get_payload(decode=True)
        if not payload:
            return ""
        return payload.decode(message.get_content_charset() or "utf-8", errors="replace")
