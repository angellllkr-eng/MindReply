# Technology Stack

## Core Technologies
- **Framework**: ASP.NET Core MVC
- **Target**: .NET 10.0
- **Language**: C#
- **Frontend**: Razor views (CSHTML), JavaScript, jQuery, Bootstrap
- **Validation**: jQuery Validation Unobtrusive

## Development Environment
- **Build Tool**: dotnet SDK (Microsoft.NET.Sdk.Web)
- **Code Style**: Nullable enabled, ImplicitUsings enabled
- **Development Ports**: HTTP 5256, HTTPS 7198 (from launchSettings.json)

## Configuration Files
- **WebApplication1.csproj**: .NET 10.0 Web SDK project
- **appsettings.json**: Logging configuration (Information level)
- **appsettings.Development.json**: Development-specific settings
- **launchSettings.json**: Debug profiles for HTTP/HTTPS

## Runtime Dependencies
- **Built-in**: Microsoft.NET.Sdk.Web (includes Kestrel, MVC, Razor)
- **External Libraries**:
  - Bootstrap (static lib/wwwroot/lib/bootstrap/)
  - jQuery (static lib/wwwroot/lib/jquery/)
  - jQuery Validation (static lib/wwwroot/lib/jquery-validation/)
  - jQuery Validation Unobtrusive (static lib/wwwroot/lib/jquery-validation-unobtrusive/)
