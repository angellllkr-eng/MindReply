using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers;

public class MRAgentController : Controller
{
    public IActionResult Index()
    {
        var vm = new MRAgentViewModel
        {
            Messages = new()
            {
                new() { Role = "assistant", Content = "Hello. I'm MRagent — your executive communication partner. Whether it's a sensitive team announcement, a restructuring message, or high-stakes correspondence, I'll help you get it exactly right. What do you need to communicate today?" }
            }
        };
        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Send([FromForm] string userMessage)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
            return BadRequest(new { error = "Message cannot be empty." });

        var reply = GenerateReply(userMessage.Trim());
        return Json(new { reply });
    }

    private static string GenerateReply(string input)
    {
        var lower = input.ToLowerInvariant();

        if (lower.Contains("restructur") || lower.Contains("layoff") || lower.Contains("redundan"))
            return "Restructuring messages need three things: transparent intention, empathetic validation, and forward-looking clarity.\n\n**Framework:**\n1. **Context** — why this is happening, honestly\n2. **Impact** — who is affected and how\n3. **Support** — what you're providing (notice, severance, outplacement)\n4. **Next steps** — clear timeline, who to contact\n\nWould you like me to draft this from scratch, or refine a draft you already have?";

        if (lower.Contains("board") || lower.Contains("investor") || lower.Contains("stakeholder"))
            return "Board and investor communication demands precision and confidence.\n\n**Key principles:**\n- Lead with the headline — no burying the lede\n- Quantify wherever possible\n- Acknowledge risks, then frame your mitigation\n- End with a clear ask or next action\n\nShare the context and I'll draft the message.";

        if (lower.Contains("crisis") || lower.Contains("incident") || lower.Contains("breach"))
            return "Crisis communication has a 24-hour window. Speed and honesty matter more than polish.\n\n**Immediate framework:**\n1. **Acknowledge** — confirm the situation without speculation\n2. **Contain** — state what you've done to stop/limit impact\n3. **Commit** — what you're doing next and by when\n4. **Contact** — single point for questions\n\nWhat's the incident? I'll draft the communication immediately.";

        if (lower.Contains("feedback") || lower.Contains("performance") || lower.Contains("difficult conversation"))
            return "Difficult feedback lands best when it's specific, behaviour-focused, and paired with a path forward.\n\n**Framework:**\n- **Observation** — what you saw, not judgement\n- **Impact** — on the team, project, or relationship\n- **Request** — the specific change needed\n- **Support** — what you'll provide to help them succeed\n\nWant me to draft the full conversation script?";

        if (lower.Contains("email") || lower.Contains("message") || lower.Contains("memo") || lower.Contains("announcement"))
            return "I can help you craft this precisely. A few quick questions:\n- Who is the audience? (direct reports, peers, board, external)\n- What's the core message in one sentence?\n- What tone is needed — empathetic, authoritative, reassuring?\n\nOr share a draft and I'll refine it.";

        if (lower.Contains("resignation") || lower.Contains("leaving") || lower.Contains("departure"))
            return "Departure communications need to protect relationships on both sides.\n\n**For outgoing message:**\n- Express genuine gratitude (specific, not generic)\n- Mention what you're moving toward, not away from\n- Offer a clear handover commitment\n- Leave the door open\n\nIs this your own departure, or are you communicating someone else's?";

        return "Understood. Let me help you shape this with precision.\n\nTo give you the best version: what's the core message you need to land, and who's the primary audience? Once I have those two, I can produce something executive-ready.";
    }
}
