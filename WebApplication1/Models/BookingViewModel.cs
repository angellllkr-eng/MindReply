namespace WebApplication1.Models;

public class Professional
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Niche { get; set; } = "";
    public string ShortBio { get; set; } = "";
    public string FullBio { get; set; } = "";
    public string PhotoUrl { get; set; } = "";
    public decimal RatingStars { get; set; }
    public int ReviewCount { get; set; }
    public List<string> Languages { get; set; } = new();
    public List<string> Specialties { get; set; } = new();
    public List<string> Qualifications { get; set; } = new();
    public List<ClientReview> Reviews { get; set; } = new();
    public decimal PriceGbp { get; set; }
    public string SessionLength { get; set; } = "50 min";
    public bool IsAvailableToday { get; set; }
    public string CalendarLink { get; set; } = "";
    public string Badge { get; set; } = "";
    public string Location { get; set; } = "Remote — Worldwide";
    public int YearsExperience { get; set; }
}

public class ClientReview
{
    public string Author { get; set; } = "";
    public string Country { get; set; } = "";
    public decimal Stars { get; set; }
    public string Text { get; set; } = "";
    public string Date { get; set; } = "";
}

public class BookingViewModel
{
    public List<Professional> Professionals { get; set; } = new();
    public List<string> Categories { get; set; } = new();
    public string SelectedCategory { get; set; } = "All";
}
