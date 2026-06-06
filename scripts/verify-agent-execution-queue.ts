import assert from "node:assert/strict";
import { getAgentExecutionQueue } from "../lib/agent-execution-queue";

const queue = getAgentExecutionQueue();

assert.equal(queue.status, queue.fallbackCount === 0 ? "green" : "action-required");
assert.equal(queue.mode, "x66 execution queue");
assert.ok(queue.generatedAt);
assert.ok(queue.totalActiveAgents >= 60);
assert.ok(queue.items.length >= 4);
assert.ok(queue.items.every((item) => item.ownerId && item.ownerRole && item.actionRoute));
assert.ok(queue.items.every((item) => item.evidenceRequired.length >= 3));
assert.ok(queue.items.some((item) => item.lane === "revenue"));
assert.ok(queue.items.some((item) => item.priority === "P0"));
assert.ok(queue.items.every((item) => item.etaMinutes <= 30));

console.log("Agent execution queue checks passed.");

export {};
