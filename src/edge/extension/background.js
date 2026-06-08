const DEFAULT_ENDPOINT = "https://www.mind-reply.com/api/intake";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mindreply-intake",
    title: "MindReply: clarify next move",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !info.selectionText) return;
  const endpoint = (await chrome.storage.sync.get("endpoint")).endpoint || DEFAULT_ENDPOINT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: info.selectionText, source: "extension" })
  });
  const decision = await response.json();
  await chrome.tabs.sendMessage(tab.id, { type: "MINDREPLY_DECISION", decision });
});
