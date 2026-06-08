chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "MINDREPLY_DECISION") return;
  const decision = message.decision;
  const existing = document.getElementById("mindreply-inline-decision");
  if (existing) existing.remove();

  const panel = document.createElement("aside");
  panel.id = "mindreply-inline-decision";
  panel.innerHTML = `
    <strong>MindReply</strong>
    <p>${decision.synthesis}</p>
    <button>${decision.recommendedAction.label}</button>
    <small>Risk: ${decision.risk.level} · Receipt: ${decision.receipt.id}</small>
  `;
  document.body.appendChild(panel);
});
