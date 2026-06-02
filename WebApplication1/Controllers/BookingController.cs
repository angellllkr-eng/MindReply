using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers;

public class BookingController : Controller
{
    private static readonly List<Professional> _professionals = new()
    {
        // ── Mental Health & Psychotherapy ──────────────────────────────────────
        new()
        {
            Id = 1,
            Name = "Dr. Isabelle Fontaine",
            Role = "Clinical Psychologist",
            Niche = "Mental Health & Life Transitions",
            ShortBio = "Specialist in anxiety, burnout and major life transitions. Calm, evidence-based, deeply human.",
            FullBio = "Dr. Isabelle Fontaine is a Chartered Clinical Psychologist with over 14 years of experience working with adults navigating anxiety disorders, occupational burnout, and significant life transitions. Trained at the Sorbonne and the Institute of Psychiatry, Psychology & Neuroscience (King's College London), she integrates Cognitive Behavioural Therapy, Acceptance & Commitment Therapy, and schema-focused approaches into a deeply personalised practice. Her clients include senior executives, medical professionals, and individuals at major crossroads — divorce, career change, bereavement, and identity shifts. Sessions are conducted exclusively online, in English and French.",
            PhotoUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 214,
            Languages = new() { "English", "French" },
            Specialties = new() { "Anxiety", "Burnout", "Life Transitions", "CBT", "ACT", "Schema Therapy" },
            Qualifications = new() { "DClinPsy — King's College London", "MSc Clinical Psychology — Sorbonne", "Chartered Member, British Psychological Society", "BABCP Accredited CBT Therapist" },
            YearsExperience = 14,
            Location = "Remote — Worldwide",
            PriceGbp = 180,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Isabelle%20Fontaine",
            Badge = "Top Rated",
            Reviews = new()
            {
                new() { Author = "Sarah M.", Country = "UK", Stars = 5.0m, Text = "Dr. Fontaine helped me navigate the most difficult period of my career. Her approach is calm, structured and genuinely transformative. I've recommended her to three colleagues.", Date = "March 2025" },
                new() { Author = "Laurent B.", Country = "France", Stars = 5.0m, Text = "J'ai travaillé avec Isabelle pendant 8 mois après un burnout sévère. Sa rigueur clinique et son humanité font une combinaison rare. Je suis revenu à moi-même.", Date = "January 2025" },
                new() { Author = "Priya K.", Country = "UAE", Stars = 4.9m, Text = "Exceptional. She helped me separate who I am from what I do — something I didn't even know I needed. The life transitions framework she uses is brilliant.", Date = "November 2024" }
            }
        },
        new()
        {
            Id = 2,
            Name = "Marcus Webb, MSc",
            Role = "Psychotherapist",
            Niche = "Men's Mental Health & Identity",
            ShortBio = "Focused exclusively on men navigating identity, purpose, relationships and modern pressure.",
            FullBio = "Marcus Webb is a UKCP-registered psychotherapist who has spent 11 years working exclusively with men. His practice centres on the unique psychological pressures facing modern men — identity crises, relational disconnection, the weight of provider roles, and the difficulty of asking for help. Drawing on Acceptance & Commitment Therapy, relational psychotherapy, and narrative approaches, Marcus creates a space that is direct, non-judgmental, and practically focused. He works with men across the UK, North America, and the Middle East.",
            PhotoUrl = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.8m,
            ReviewCount = 178,
            Languages = new() { "English", "German" },
            Specialties = new() { "Men's Health", "Identity", "Relationship Issues", "ACT", "Masculinity", "Anger" },
            Qualifications = new() { "MSc Psychotherapy — University of Edinburgh", "UKCP Registered Psychotherapist", "Certificate in ACT — Association for Contextual Behavioural Science" },
            YearsExperience = 11,
            Location = "Remote — Worldwide",
            PriceGbp = 160,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Marcus%20Webb",
            Badge = "",
            Reviews = new()
            {
                new() { Author = "James T.", Country = "UK", Stars = 5.0m, Text = "First therapist I've ever actually stayed with. Marcus doesn't tiptoe. He's direct, gets to the point, and genuinely understands what men go through without the fluff.", Date = "February 2025" },
                new() { Author = "David R.", Country = "Canada", Stars = 4.8m, Text = "Helped me understand why I was sabotaging my relationship. The work was uncomfortable but necessary. Real results.", Date = "December 2024" }
            }
        },
        new()
        {
            Id = 3,
            Name = "Dr. Amara Osei",
            Role = "Trauma & PTSD Specialist",
            Niche = "Trauma Recovery & Resilience",
            ShortBio = "Trained in EMDR and somatic therapies. Helping survivors rebuild from the inside out.",
            PhotoUrl = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
            RatingStars = 5.0m,
            ReviewCount = 97,
            Languages = new() { "English", "Twi" },
            Specialties = new() { "PTSD", "EMDR", "Somatic Therapy", "Dissociation" },
            PriceGbp = 210,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Amara%20Osei",
            Badge = "Top Rated"
        },

        // ── Child & Adolescent Psychology (ages 3–21) ─────────────────────────
        new()
        {
            Id = 4,
            Name = "Dr. Lena Kristoffersen",
            Role = "Child & Adolescent Psychologist",
            Niche = "Children & Teens · Ages 3–21",
            ShortBio = "Specialist in developmental challenges, school refusal, ASD assessment and teen identity. Play-based for young children.",
            PhotoUrl = "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 143,
            Languages = new() { "English", "Norwegian", "Swedish" },
            Specialties = new() { "ASD Assessment", "School Refusal", "Teen Anxiety", "Play Therapy" },
            PriceGbp = 190,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Lena%20Kristoffersen",
            Badge = "Top Rated"
        },
        new()
        {
            Id = 5,
            Name = "Sofia Marchetti, MA",
            Role = "Adolescent Therapist",
            Niche = "Teen Emotional Regulation · Ages 12–21",
            ShortBio = "Supports teenagers through self-harm, identity confusion, eating concerns and exam stress with non-judgemental warmth.",
            PhotoUrl = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.8m,
            ReviewCount = 89,
            Languages = new() { "English", "Italian" },
            Specialties = new() { "Self-harm", "Eating Concerns", "Exam Stress", "DBT" },
            PriceGbp = 150,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Sofia%20Marchetti",
            Badge = ""
        },

        // ── Digital & Behavioural Addictions ──────────────────────────────────
        new()
        {
            Id = 6,
            Name = "Dr. Kenji Nakamura",
            Role = "Behavioural Addiction Psychologist",
            Niche = "Gaming · Screen · PC Addiction & Aggression",
            ShortBio = "Cutting-edge specialist in compulsive gaming, screen addiction and co-occurring aggression. Used by esports orgs and families worldwide.",
            PhotoUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 201,
            Languages = new() { "English", "Japanese" },
            Specialties = new() { "Gaming Disorder", "Screen Addiction", "Impulse Control", "Anger Management" },
            PriceGbp = 195,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Kenji%20Nakamura",
            Badge = "High Demand"
        },

        // ── Executive & Performance Coaching ──────────────────────────────────
        new()
        {
            Id = 7,
            Name = "Dr. Claire Ashworth",
            Role = "Executive Performance Coach",
            Niche = "C-Suite & Leadership Performance",
            ShortBio = "Former management consultant turned executive coach. Specialises in high-stakes decision-making, impostor syndrome and sustainable leadership.",
            PhotoUrl = "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face",
            RatingStars = 5.0m,
            ReviewCount = 132,
            Languages = new() { "English" },
            Specialties = new() { "Leadership", "Impostor Syndrome", "Decision Fatigue", "Board Presence" },
            PriceGbp = 380,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Claire%20Ashworth",
            Badge = "Executive"
        },
        new()
        {
            Id = 8,
            Name = "Rajan Mehta, MBA",
            Role = "Business & Mindset Coach",
            Niche = "Entrepreneurs & Founders",
            ShortBio = "Built and sold two startups. Coaches founders on mental resilience, scaling pressure and the psychological cost of ambition.",
            PhotoUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.7m,
            ReviewCount = 88,
            Languages = new() { "English", "Hindi" },
            Specialties = new() { "Founder Burnout", "Scaling Anxiety", "Exit Planning Stress", "Vision Clarity" },
            PriceGbp = 290,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Rajan%20Mehta",
            Badge = ""
        },

        // ── Couples & Relationship Therapy ────────────────────────────────────
        new()
        {
            Id = 9,
            Name = "Dr. Valentina Cruz",
            Role = "Couples & Relationship Therapist",
            Niche = "Modern Relationships & Intimacy",
            ShortBio = "Works with couples and individuals navigating modern relationships, attachment wounds, infidelity and intimacy blocks.",
            PhotoUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 167,
            Languages = new() { "English", "Spanish" },
            Specialties = new() { "Couples Therapy", "Attachment", "Infidelity Recovery", "Intimacy" },
            PriceGbp = 220,
            SessionLength = "80 min",
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Valentina%20Cruz",
            Badge = "Top Rated"
        },

        // ── Occupational & Workplace ───────────────────────────────────────────
        new()
        {
            Id = 10,
            Name = "Dr. Patrick Nkemdirim",
            Role = "Occupational Psychologist",
            Niche = "Workplace Wellbeing & Organisational Stress",
            ShortBio = "Partners with organisations and individuals on workplace toxicity, career change psychology and occupational burnout.",
            PhotoUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.8m,
            ReviewCount = 115,
            Languages = new() { "English", "French", "Igbo" },
            Specialties = new() { "Burnout", "Toxic Workplaces", "Career Change", "Org Psychology" },
            PriceGbp = 175,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Patrick%20Nkemdirim",
            Badge = ""
        },

        // ── Neurodiversity ────────────────────────────────────────────────────
        new()
        {
            Id = 11,
            Name = "Anya Petrov, DClinPsy",
            Role = "Neurodiversity Specialist",
            Niche = "ADHD · Autism · Twice Exceptional",
            ShortBio = "Late diagnosis support, masking recovery and identity work for ADHD and autistic adults navigating a neurotypical world.",
            PhotoUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
            RatingStars = 5.0m,
            ReviewCount = 203,
            Languages = new() { "English", "Russian" },
            Specialties = new() { "ADHD", "Autism", "Late Diagnosis", "Masking" },
            PriceGbp = 185,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Anya%20Petrov",
            Badge = "High Demand"
        },

        // ── Grief & Loss ──────────────────────────────────────────────────────
        new()
        {
            Id = 12,
            Name = "Dr. James Thornton",
            Role = "Grief & Bereavement Therapist",
            Niche = "Loss · Complicated Grief · End-of-Life",
            ShortBio = "Walks alongside those navigating loss, anticipatory grief and the aftermath of sudden or traumatic deaths.",
            PhotoUrl = "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 74,
            Languages = new() { "English" },
            Specialties = new() { "Complicated Grief", "Bereavement", "Anticipatory Grief", "Trauma" },
            PriceGbp = 170,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20James%20Thornton",
            Badge = ""
        },

        // ── Academic & Private Tutoring (Professors) ──────────────────────────
        new()
        {
            Id = 13,
            Name = "Prof. Helena Schneider",
            Role = "Private Academic Tutor — Professor",
            Niche = "University & Postgraduate · Sciences & Medicine",
            ShortBio = "Professor of Biomedical Sciences. Private 1-to-1 and small group tutoring for medical, pre-med and science students.",
            PhotoUrl = "https://images.unsplash.com/photo-1614204424926-197c38e10b09?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 61,
            Languages = new() { "English", "German" },
            Specialties = new() { "Medicine", "Biology", "Dissertation Support", "Research Methods" },
            PriceGbp = 250,
            SessionLength = "60 min",
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Prof.%20Helena%20Schneider",
            Badge = "Professor"
        },
        new()
        {
            Id = 14,
            Name = "Prof. Alejandro Vega",
            Role = "Private Academic Tutor — Professor",
            Niche = "Economics · Finance · MBA Prep",
            ShortBio = "Former Harvard faculty. Intensive private coaching for MBA applicants, economics students and finance professionals.",
            PhotoUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
            RatingStars = 5.0m,
            ReviewCount = 48,
            Languages = new() { "English", "Spanish", "Portuguese" },
            Specialties = new() { "MBA Prep", "Microeconomics", "Finance", "Case Studies" },
            PriceGbp = 320,
            SessionLength = "60 min",
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Prof.%20Alejandro%20Vega",
            Badge = "Professor"
        },
        new()
        {
            Id = 15,
            Name = "Prof. Yuki Tanaka",
            Role = "Private Academic Tutor — Professor",
            Niche = "Technology · Computer Science · AI Ethics",
            ShortBio = "Tokyo University adjunct professor. Tutors in CS fundamentals, systems design and AI ethics for students and career switchers.",
            PhotoUrl = "https://images.unsplash.com/photo-1548544027-1a2bf7b5173c?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.8m,
            ReviewCount = 55,
            Languages = new() { "English", "Japanese" },
            Specialties = new() { "Computer Science", "Systems Design", "AI Ethics", "Algorithms" },
            PriceGbp = 270,
            SessionLength = "60 min",
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Prof.%20Yuki%20Tanaka",
            Badge = "Professor"
        },

        // ── Nutritional & Body Psychology ─────────────────────────────────────
        new()
        {
            Id = 16,
            Name = "Dr. Miriam Goldstein",
            Role = "Nutritional Psychologist",
            Niche = "Food Relationships · Body Image · Eating Disorders",
            ShortBio = "Bridges the psychology of eating with clinical nutrition. Non-diet, weight-neutral, deeply compassionate.",
            PhotoUrl = "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 129,
            Languages = new() { "English", "Hebrew" },
            Specialties = new() { "Eating Disorders", "Body Image", "Intuitive Eating", "ARFID" },
            PriceGbp = 165,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Miriam%20Goldstein",
            Badge = ""
        },

        // ── Sleep & Fatigue ───────────────────────────────────────────────────
        new()
        {
            Id = 17,
            Name = "Dr. Cian O'Brien",
            Role = "Sleep Psychologist",
            Niche = "Chronic Insomnia · Fatigue · Sleep Disorders",
            ShortBio = "Uses CBT-I and chronotherapy to fix broken sleep in high-performers, shift workers and those with chronic fatigue.",
            PhotoUrl = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face&seed=cian",
            RatingStars = 4.8m,
            ReviewCount = 91,
            Languages = new() { "English", "Irish" },
            Specialties = new() { "Insomnia", "CBT-I", "Chronic Fatigue", "Shift Work" },
            PriceGbp = 175,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Cian%20OBrien",
            Badge = "High Demand"
        },

        // ── Sex & Intimacy Therapy ────────────────────────────────────────────
        new()
        {
            Id = 18,
            Name = "Dr. Naomi Adler",
            Role = "Sex & Intimacy Therapist",
            Niche = "Sexual Wellbeing · Libido · Intimacy Blocks",
            ShortBio = "Certified sex therapist working with individuals and couples on desire discrepancy, intimacy anxiety and sexual identity.",
            PhotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.9m,
            ReviewCount = 83,
            Languages = new() { "English", "Hebrew" },
            Specialties = new() { "Desire Discrepancy", "Intimacy Anxiety", "Sexual Identity", "Vaginismus" },
            PriceGbp = 195,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Naomi%20Adler",
            Badge = ""
        },

        // ── Financial Psychology ──────────────────────────────────────────────
        new()
        {
            Id = 19,
            Name = "Thomas Eriksson, MSc",
            Role = "Financial Psychologist",
            Niche = "Money Mindset · Wealth Anxiety · Financial Trauma",
            ShortBio = "Explores the psychological roots of overspending, financial avoidance and wealth guilt. Used by HNWI clients globally.",
            PhotoUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
            RatingStars = 4.7m,
            ReviewCount = 66,
            Languages = new() { "English", "Swedish" },
            Specialties = new() { "Wealth Anxiety", "Financial Trauma", "Overspending", "HNWI Psychology" },
            PriceGbp = 220,
            IsAvailableToday = true,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Thomas%20Eriksson",
            Badge = "Niche"
        },

        // ── Sports & Performance Psychology ──────────────────────────────────
        new()
        {
            Id = 20,
            Name = "Dr. Zara Okafor",
            Role = "Sports & Performance Psychologist",
            Niche = "Elite Athletes · Performance Anxiety · Flow State",
            ShortBio = "Consultant to Olympic athletes and professional teams. Specialises in performance under pressure, slumps and mental blocks.",
            PhotoUrl = "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face",
            RatingStars = 5.0m,
            ReviewCount = 112,
            Languages = new() { "English", "Yoruba" },
            Specialties = new() { "Performance Anxiety", "Flow State", "Injury Recovery", "Mental Blocks" },
            PriceGbp = 240,
            IsAvailableToday = false,
            CalendarLink = "mailto:angelllkr@gmail.com?subject=Booking%20-%20Dr.%20Zara%20Okafor",
            Badge = "Elite"
        }
    };

    private static readonly List<string> _categories = new()
    {
        "All",
        "Mental Health",
        "Children & Teens",
        "Behavioural Addictions",
        "Executive Coaching",
        "Couples & Relationships",
        "Workplace",
        "Neurodiversity",
        "Grief & Loss",
        "Academic Tutors",
        "Nutritional Psychology",
        "Sleep",
        "Intimacy Therapy",
        "Financial Psychology",
        "Sports & Performance"
    };

    private static Dictionary<string, string> _categoryMap = new()
    {
        { "Mental Health", new[] { "Clinical Psychologist", "Psychotherapist", "Trauma & PTSD Specialist" }.Aggregate("", (a, b) => a + b) },
    };

    public IActionResult Detail(int id)
    {
        var pro = _professionals.FirstOrDefault(p => p.Id == id);
        if (pro == null) return NotFound();
        return View(pro);
    }

    [HttpGet]
    public IActionResult Group(int id)
    {
        var pro = _professionals.FirstOrDefault(p => p.Id == id);
        if (pro == null) return NotFound();
        var vm = new GroupBookingViewModel { Professional = pro, BasePrice = pro.PriceGbp, GroupSize = 1 };
        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Group(int id, int groupSize)
    {
        var pro = _professionals.FirstOrDefault(p => p.Id == id);
        if (pro == null) return NotFound();
        groupSize = Math.Max(1, Math.Min(groupSize, 500));
        var vm = new GroupBookingViewModel { Professional = pro, BasePrice = pro.PriceGbp, GroupSize = groupSize };
        return View(vm);
    }

    public IActionResult Index(string category = "All")
    {
        var filtered = category == "All"
            ? _professionals
            : _professionals.Where(p => p.Role.Contains(category) || p.Niche.Contains(category) || MapCategory(p, category)).ToList();

        var vm = new BookingViewModel
        {
            Professionals = filtered,
            Categories = _categories,
            SelectedCategory = category
        };
        return View(vm);
    }

    public IActionResult Detail(int id)
    {
        var p = _professionals.FirstOrDefault(x => x.Id == id);
        if (p == null) return NotFound();
        return View(p);
    }

    [HttpGet]
    public IActionResult Group(int id)
    {
        var p = _professionals.FirstOrDefault(x => x.Id == id);
        var vm = new GroupBookingViewModel
        {
            Professional = p,
            BasePrice = p?.PriceGbp ?? 0,
            GroupSize = 1
        };
        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Group(int id, int groupSize)
    {
        var p = _professionals.FirstOrDefault(x => x.Id == id);
        var vm = new GroupBookingViewModel
        {
            Professional = p,
            BasePrice = p?.PriceGbp ?? 0,
            GroupSize = Math.Max(1, Math.Min(500, groupSize))
        };
        return View(vm);
    }

    private static bool MapCategory(Professional p, string cat) => cat switch
    {
        "Mental Health" => new[] { "Clinical Psychologist", "Psychotherapist", "Trauma & PTSD Specialist", "Grief & Bereavement Therapist", "Neurodiversity Specialist", "Sleep Psychologist", "Nutritional Psychologist", "Sex & Intimacy Therapist" }.Contains(p.Role),
        "Children & Teens" => p.Role.Contains("Child") || p.Role.Contains("Adolescent"),
        "Behavioural Addictions" => p.Role.Contains("Addiction"),
        "Executive Coaching" => p.Role.Contains("Executive") || p.Role.Contains("Business"),
        "Couples & Relationships" => p.Role.Contains("Couples") || p.Role.Contains("Relationship"),
        "Workplace" => p.Role.Contains("Occupational"),
        "Neurodiversity" => p.Role.Contains("Neurodiversity"),
        "Grief & Loss" => p.Role.Contains("Grief"),
        "Academic Tutors" => p.Role.Contains("Tutor") || p.Role.Contains("Professor"),
        "Nutritional Psychology" => p.Role.Contains("Nutritional"),
        "Sleep" => p.Role.Contains("Sleep"),
        "Intimacy Therapy" => p.Role.Contains("Sex") || p.Role.Contains("Intimacy"),
        "Financial Psychology" => p.Role.Contains("Financial"),
        "Sports & Performance" => p.Role.Contains("Sports") || p.Role.Contains("Performance"),
        _ => false
    };
}
