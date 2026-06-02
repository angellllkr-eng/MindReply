using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers;

public class MRHubController : Controller
{
    public IActionResult Index()
    {
        var plans = new List<PricingPlan>
        {
            new()
            {
                Name = "Essential",
                PriceGbp = 0,
                Period = "Free",
                Features = new() { "5 MRagent messages / month", "Browse all specialists", "Public community access", "Email support" },
                CtaText = "Start Free"
            },
            new()
            {
                Name = "Professional",
                PriceGbp = 29,
                Features = new() { "Unlimited MRagent messages", "Priority booking", "MRtools access", "MRhealth dashboard", "Session history & notes" },
                IsHighlighted = true,
                Badge = "Most Popular",
                CtaText = "Start 7-day trial"
            },
            new()
            {
                Name = "Executive",
                PriceGbp = 89,
                Features = new() { "Everything in Professional", "Dedicated MRagent persona", "Executive communication library", "MRbehaviour premium insights", "Group booking management", "Direct specialist introductions", "Monthly strategy session" },
                Badge = "Executive",
                CtaText = "Apply Now"
            }
        };

        ViewBag.Plans = plans;
        return View();
    }

    public IActionResult Pack()
    {
        ViewBag.PackDiscount = 30;
        ViewBag.BonusDays = 2;
        return View();
    }
}
