namespace WebApplication1.Models;

public class ChatMessage
{
    public string Role { get; set; } = "user"; // "user" | "assistant"
    public string Content { get; set; } = "";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class MRAgentViewModel
{
    public List<ChatMessage> Messages { get; set; } = new();
    public string InputPlaceholder { get; set; } = "Ask MRagent — executive communication, team messaging, sensitive topics…";
}

public class PricingPlan
{
    public string Name { get; set; } = "";
    public decimal PriceGbp { get; set; }
    public string Period { get; set; } = "/ month";
    public List<string> Features { get; set; } = new();
    public bool IsHighlighted { get; set; }
    public string Badge { get; set; } = "";
    public string CtaText { get; set; } = "Get Started";
}

public class GroupBookingViewModel
{
    public Professional? Professional { get; set; }
    public int GroupSize { get; set; } = 1;
    public decimal BasePrice { get; set; }
    public decimal DiscountPercent => GroupSize >= 10 ? 10m : 0m;
    public decimal DiscountedPrice => BasePrice * (1 - DiscountPercent / 100);
    public decimal TotalPrice => DiscountedPrice * GroupSize;
    public string BonusText => GroupSize >= 10 ? "+2 bonus days of async support included" : "";
}
