import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { messageRescueOffer } from "../lib/rescue-offer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const rescueCheckoutRoutePath = "app/api/checkout/rescue/route.ts";
const rescueSessionRoutePath = "app/api/checkout/rescue-session/route.ts";
const rescuePagePath = "app/rescue/page.tsx";
const rescueWorkspacePath = "app/rescue/workspace/page.tsx";
const purchasePanelPath = "components/PurchaseSuccessPanel.tsx";
const seoPath = "lib/seo.ts";

const checkoutRoute = readProjectFile(rescueCheckoutRoutePath);
const sessionRoute = readProjectFile(rescueSessionRoutePath);
const rescuePage = readProjectFile(rescuePagePath);
const rescueWorkspace = readProjectFile(rescueWorkspacePath);
const purchasePanel = readProjectFile(purchasePanelPath);
const seo = readProjectFile(seoPath);

assert(messageRescueOffer.slug === "message-overload-rescue", "Message Rescue slug changed unexpectedly.");
assert(messageRescueOffer.amount === 4900, "Message Rescue checkout amount must stay at GBP 49.00.");
assert(messageRescueOffer.messages === 3, "Message Rescue offer must include 3 messages.");
assert(messageRescueOffer.deliveryMinutes === 15, "Message Rescue offer must promise the 15-minute outcome path.");
assert(existsSync(join(process.cwd(), rescueSessionRoutePath)), "Missing /api/checkout/rescue-session verification route.");
assert(
  /metadata:\s*{\s*type:\s*"message_rescue"[\s\S]*offer:\s*messageRescueOffer\.slug[\s\S]*messages:\s*String\(messageRescueOffer\.messages\)/.test(checkoutRoute),
  "Message Rescue checkout sessions must include offer metadata for server verification.",
);
assert(
  /session\.metadata\?\.type\s*!==\s*"message_rescue"/.test(sessionRoute),
  "Message Rescue session verification must reject non-rescue checkout sessions.",
);
assert(
  /session\.metadata\.offer\s*!==\s*messageRescueOffer\.slug/.test(sessionRoute),
  "Message Rescue verification must check the offer slug.",
);
assert(
  /\/api\/checkout\/rescue/.test(rescuePage),
  "Message Rescue page must start checkout through /api/checkout/rescue.",
);
assert(
  /\/api\/tools\/email-polisher/.test(rescueWorkspace),
  "Message Rescue workspace must deliver output through the existing tool API.",
);
assert(
  /mindreply\.rescue\.workspace/.test(rescueWorkspace),
  "Message Rescue workspace must persist the buyer's three message slots.",
);
assert(
  /Your next\s*{messageRescueOffer\.messages}\s*difficult messages finished in\s*{messageRescueOffer\.deliveryMinutes}\s*minutes/.test(rescuePage),
  "Message Rescue page must lead with the fast outcome copy.",
);
assert(
  /\/api\/checkout\/rescue-session\?/.test(purchasePanel),
  "Dashboard must verify Message Rescue sessions before activation.",
);
assert(
  !/const activeRescue\s*=\s*isRescueReturn\s*\|\|/.test(purchasePanel),
  "Message Rescue query params must not activate rescue access without confirmed Stripe verification.",
);
assert(
  /data\.confirmed[\s\S]*window\.localStorage\.setItem\("mindreply\.rescue"/.test(purchasePanel),
  "Message Rescue activation must require confirmed server verification.",
);
assert(/\/rescue\/workspace/.test(purchasePanel), "Verified checkout success must link to the Message Rescue workspace.");
assert(/"\/rescue"/.test(seo), "Message Rescue route must be included in SEO public routes.");
assert(/"\/rescue\/workspace"/.test(seo), "Message Rescue workspace must be included in SEO public routes.");

console.log("Message Rescue offer verification passed.");
