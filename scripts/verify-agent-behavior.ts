import assert from "node:assert/strict";
import { analyzeCommunication, buildLocalAgentReply } from "../lib/agent-engine";

const broadPrompt = "What is a good way to stop procrastinating before a client presentation?";
const broadAnalysis = analyzeCommunication(broadPrompt);
assert.equal(broadAnalysis.intent, "broad_question");

const broadReply = buildLocalAgentReply(broadPrompt, broadAnalysis);
assert.match(broadReply, /client presentation|presentation|procrastinating/i);
assert.match(broadReply, /practical|simple|first/i);
assert.match(broadReply, /Growth|Pro|credits|professional/i);
assert.doesNotMatch(broadReply, /Give me the situation/i);

const checkoutPrompt = "I need help buying credits and booking a video session";
const checkoutAnalysis = analyzeCommunication(checkoutPrompt);
assert.equal(checkoutAnalysis.intent, "booking_and_credits");

const checkoutReply = buildLocalAgentReply(checkoutPrompt, checkoutAnalysis);
assert.match(checkoutReply, /credit/i);
assert.match(checkoutReply, /video/i);
assert.match(checkoutReply, /dashboard confirms access|session room/i);

const rescuePrompt = "I have a difficult client reply I keep avoiding and need it send-ready today";
const rescueAnalysis = analyzeCommunication(rescuePrompt);
assert.equal(rescueAnalysis.intent, "message_rescue");

const rescueReply = buildLocalAgentReply(rescuePrompt, rescueAnalysis);
assert.match(rescueReply, /Message Rescue/i);
assert.match(rescueReply, /3 difficult messages|send-ready/i);
assert.match(rescueReply, /credits|professional/i);

const planPrompt = "Which plan should I choose for daily work?";
const planAnalysis = analyzeCommunication(planPrompt);
assert.equal(planAnalysis.intent, "membership_upgrade");

const planReply = buildLocalAgentReply(planPrompt, planAnalysis);
assert.match(planReply, /Growth/i);
assert.match(planReply, /Pro/i);
assert.match(planReply, /daily/i);

console.log("MRagent behavior checks passed.");

export {};
