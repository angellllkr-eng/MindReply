# Development Guidelines

## Code Quality Standards

### Architecture Patterns
- **MVC with File-scoped Namespaces**: All controllers use `namespace WebApplication1.Controllers;` style (5/5 files)
- **Controller Organization**: Each feature gets its own controller (Booking, MRAgent, MRHub)
- **ViewModels for Data Transfer**: Clean separation between domain models and view data (5/5 files)
- **Static In-Memory Data**: Simple services use static collections (BookingController)

### C# Conventions
- **Property Initializers**: Use `= "";` or `= new();` for default values (5/5 files)
- **Expression-bodied Members**: Use `=>` for simple property/switch mappings (BookingController.MapCategory)
- **Collection Initializers**: Use `new() { "item1", "item2" }` syntax (5/5 files)
- **Nullable Reference Types**: Enabled globally (`<Nullable>enable</Nullable>` in csproj)

### JavaScript Standards
- **IIFE Pattern**: Wrap entire JS files in `(function () { 'use strict'; ... }());` (booking.js)
- **Modern DOM API**: Use `querySelectorAll`, `forEach`, arrow functions
- **Data Attributes**: Use `data-*` attributes for server-to-client communication

## Structural Conventions

### Controllers (4 patterns observed)
1. **Standard MVC Actions**: Return `IActionResult` with `View(model)`
2. **JSON APIs**: Use `[HttpPost]` with `Json()` return for AJAX endpoints (MRAgentController.Send)
3. **Anti-Forgery**: Protect POST actions with `[ValidateAntiForgeryToken]` (3/3 controllers)
4. **Static Data**: Large datasets defined as `private static readonly` collections

### Models & ViewModels
- **Clean Separation**: ViewModels contain only data needed for specific views
- **Nested Models**: Use child classes (Professional → ClientReview) 
- **Default Values**: Initialize collections and strings to avoid nulls

### Program.cs Configuration
- **Minimal API Style**: Uses top-level statements with `var builder = WebApplication.CreateBuilder(args)`
- **Standard Middleware**: `UseHttpsRedirection`, `UseRouting`, `UseAuthorization`
- **Static Assets**: Use `app.MapStaticAssets()` for wwwroot content

## Textual Standards

### Naming Conventions
- **Controllers**: `[Feature]Controller.cs` with action names matching view names
- **Models**: `[Feature]ViewModel.cs` for view-specific data structures
- **JavaScript**: Use descriptive names with prefixes (`mr-currency-btn`, `profGrid`)
- **C# Methods**: CamelCase for private methods, descriptive names for business logic

### Documentation Pattern
- **Inline Comments**: Use `// ── [Section Title] ──` for major code blocks
- **Minimal Comments**: Only comment when code isn't self-explanatory
- **Error Messages**: User-friendly messages in JSON responses

## Common Implementation Patterns

### Data Filtering & Mapping
```csharp
// Pattern seen in BookingController
private static bool MapCategory(Professional p, string cat) => cat switch
{
    "Category" => p.Role.Contains("Keyword") || ...,
    _ => false
};
```

### Input Validation & Sanitization
```csharp
// Pattern seen in multiple controllers
groupSize = Math.Max(1, Math.Min(groupSize, 500)); // Clamp values
if (string.IsNullOrWhiteSpace(userMessage))
    return BadRequest(new { error = "Message cannot be empty." });
```

### Static Data Initialization
```csharp
// Large datasets use detailed object initializers
private static readonly List<Professional> _professionals = new()
{
    new()
    {
        Id = 1,
        Name = "Dr. Isabelle Fontaine",
        Role = "Clinical Psychologist",
        // ... extensive property initialization
    }
};
```

### JavaScript Interaction Patterns
```javascript
// Data attribute pattern for dynamic content
var base = parseFloat(el.getAttribute('data-base-gbp'));
el.textContent = formatPrice(base, activeCurrency.rate, activeCurrency.symbol);
```

## Recurring Design Approaches

1. **In-Memory Data Store**: No database dependency for MVP/prototype
2. **Feature-Based Organization**: Each major feature gets controller + view + JS
3. **Progressive Enhancement**: Core functionality works without JS, enhanced with it
4. **Error Handling**: Graceful fallbacks with `NotFound()` and user-friendly messages
5. **Responsive UI**: Bootstrap-based layout with custom CSS for specialized features

## Popular Annotations & Attributes
- `[HttpGet]`, `[HttpPost]` - HTTP method specification
- `[ValidateAntiForgeryToken]` - Security for form submissions
- `[FromForm]` - Model binding for form data
- `class` attributes - Used sparingly for semantic HTML