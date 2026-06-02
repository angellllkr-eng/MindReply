# Project Structure

## Directory Layout
```
WebApplication1/
├── Controllers/
│   ├── BookingController.cs   # Booking CRUD & views
│   ├── HomeController.cs      # Landing page
│   ├── MRAgentController.cs   # AI agent interaction
│   └── MRHubController.cs     # Real-time hub
├── Models/
│   ├── BookingViewModel.cs    # Booking form/data model
│   ├── MRAgentViewModel.cs    # Agent request/response model
│   └── ErrorViewModel.cs      # Error display model
├── Views/
│   ├── Booking/               # Index, Group, Detail views
│   ├── MRAgent/               # Agent chat/interaction view
│   ├── MRHub/                 # Hub connection view
│   ├── Home/                  # Index, Privacy
│   └── Shared/                # _Layout, Error, partials
├── wwwroot/
│   ├── css/site.css           # Global styles
│   ├── js/booking.js          # Booking-specific JS
│   ├── js/site.js             # Global JS
│   └── lib/                   # Bootstrap, jQuery, validation
├── Program.cs                 # App entry point & DI setup
├── appsettings.json           # Configuration
└── WebApplication1.csproj     # Project file (net10.0)
```

## Architectural Pattern
- Standard ASP.NET Core MVC (Model-View-Controller)
- ViewModels used to pass data between controllers and Razor views
- Shared layout (_Layout.cshtml) wraps all pages via _ViewStart.cshtml
- Static assets served from wwwroot

## Component Relationships
- Controllers → ViewModels → Razor Views
- Booking flow: BookingController ↔ BookingViewModel ↔ Booking/* views + booking.js
- Agent flow: MRAgentController ↔ MRAgentViewModel ↔ MRAgent/Index.cshtml
- Hub flow: MRHubController ↔ MRHub/Index.cshtml