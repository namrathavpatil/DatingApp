# Project Overview

This Dating App is a modern, full-stack web application designed to connect users in a secure and user-friendly environment. Built with .NET Core Web API for the backend and Angular for the frontend, the project demonstrates best practices in software architecture, security, and user experience.

## Best Features to Emphasize in Demo

- **Robust Authentication & Security:**
  - JWT-based authentication for secure, stateless sessions
  - Secure password hashing and storage
  - Role-based authorization for protected endpoints

- **Clean Architecture & SOLID Principles:**
  - Separation of concerns between controllers, services, and data access
  - Use of dependency injection for maintainability and testability
  - Implementation of design patterns like Singleton

- **Modern Frontend with Angular:**
  - Responsive, component-based UI
  - Real-time updates and smooth user experience
  - Strong form validation and error handling

- **Rich User Features:**
  - Profile management and photo uploads
  - Matching and messaging system
  - User preferences and settings

- **Scalability & Maintainability:**
  - Async/await for efficient resource usage
  - Centralized error handling and logging
  - Modular codebase for easy extension

# Table of Contents

- C# Best Practices & SOLID Implementation
- SOLID Principles Implementation
- C# Features Implementation
- Design Patterns
- Error Handling Strategy
- Async/Await Patterns in the Application
- Why Async in Controllers?
- Dependency Injection in Backend
- Token Validation, Storage, and Usage
- Secret Key Management
- Password Security

# Frameworks & Versions Used

- **Backend:**
  - .NET Core: 9.0 or later
  - Entity Framework Core: 6.x
  - ASP.NET Core Web API
  - SQLite

- **Frontend:**
  - Angular: 16+
  - TypeScript: 4.x
  - RxJS: 7.x
  - Angular CLI

# Dating App Implementation - Best Practices & SOLID Principles

## C# Best Practices & SOLID Implementation

### 1. SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
```csharp
// Each class has a single responsibility
public class TokenService : ITokenService
{
    // Only handles token-related operations
    public string CreateToken(AppUser user) { ... }
}

public class PhotoService : IPhotoService
{
    // Only handles photo-related operations
    public async Task<Photo> AddPhoto(IFormFile file) { ... }
}
```

#### Open/Closed Principle (OCP)
```csharp
// Open for extension, closed for modification
public interface IUserService
{
    Task<UserDto> GetUserAsync(int id);
}

public class UserService : IUserService
{
    // Base implementation
}

public class PremiumUserService : IUserService
{
    // Extended functionality without modifying base
}
```

#### Liskov Substitution Principle (LSP)
```csharp
// Derived classes can substitute base classes
public abstract class BaseController : ControllerBase
{
    protected readonly IUserService _userService;
    
    public BaseController(IUserService userService)
    {
        _userService = userService;
    }
}

public class UserController : BaseController
{
    // Can be used wherever BaseController is expected
}
```

#### Interface Segregation Principle (ISP)
```csharp
// Clients only depend on interfaces they use
public interface IPhotoService
{
    Task<Photo> AddPhoto(IFormFile file);
    Task DeletePhoto(int id);
}

public interface IUserService
{
    Task<UserDto> GetUserAsync(int id);
    Task UpdateUserAsync(UserDto user);
}
```

#### Dependency Inversion Principle (DIP)
```csharp
// High-level modules depend on abstractions
public class AccountController : BaseApiController
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public AccountController(
        IUserService userService,
        ITokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }
}
```

### 2. C# Features Implementation

#### Async/Await Pattern
```csharp
public async Task<ActionResult<UserDto>> GetUser(int id)
{
    try
    {
        var user = await _userService.GetUserAsync(id);
        return Ok(user);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting user");
        return StatusCode(500, "An error occurred");
    }
}
```

#### LINQ Usage
```csharp
// Efficient querying
var userPhotos = await _context.Photos
    .Where(p => p.AppUserId == userId)
    .OrderByDescending(p => p.DateAdded)
    .Select(p => new PhotoDto
    {
        Id = p.Id,
        Url = p.Url,
        IsMain = p.IsMain
    })
    .ToListAsync();
```

### 3. Design Patterns

#### Singleton Pattern (Creational)
**What is it?**
The Singleton pattern ensures that a class has only one instance and provides a global point of access to it.

**Where is it used in this project?**
- In ASP.NET Core, services like `IConfiguration` and `ILogger` are registered as singletons by the framework. This ensures only one instance exists throughout the application's lifetime.
- Example: The configuration object injected into controllers and services is a singleton.

**Example:**
```csharp
public class Logger
{
    private static Logger _instance;
    private static readonly object _lock = new object();
    private Logger() { }
    public static Logger Instance
    {
        get
        {
            lock (_lock)
            {
                if (_instance == null)
                    _instance = new Logger();
                return _instance;
            }
        }
    }
    public void Log(string message)
    {
        Console.WriteLine(message);
    }
}
// Usage:
Logger.Instance.Log("This is a log message.");
```

### 4. Error Handling Strategy

#### Global Exception Handling
```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }
}
```

#### Custom Exceptions
```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}
```

### 5. Dependency Injection Implementation

#### Service Registration
```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Scoped Services
    services.AddScoped<IUserService, UserService>();
    services.AddScoped<ITokenService, TokenService>();
    
    // Repository Registration
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IPhotoRepository, PhotoRepository>();
    
    // Unit of Work
    services.AddScoped<IUnitOfWork, UnitOfWork>();
}
```

#### Constructor Injection
```csharp
public class UserController : BaseApiController
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserService userService,
        ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }
}
```

### 6. Code Organization & Clean Architecture

#### Project Structure
```
DatingApp/
├── API/                 # Presentation Layer
│   ├── Controllers/     # API Endpoints
│   ├── DTOs/           # Data Transfer Objects
│   └── Services/       # Application Services
├── Core/               # Business Logic Layer
│   ├── Entities/       # Domain Models
│   ├── Interfaces/     # Abstractions
│   └── Services/       # Business Services
└── Infrastructure/     # Data Access Layer
    ├── Data/           # Database Context
    └── Repositories/   # Data Access
```

#### Clean Architecture Principles
- Separation of concerns
- Dependency inversion
- Interface-based design
- Domain-driven design
- Repository pattern implementation

# Technical Notes

## Authentication Implementation

### Overview
The application implements a secure JWT (JSON Web Token) based authentication system using .NET Core Web API and Angular.

### Backend Implementation (.NET Core)

#### 1. Token Service
```csharp
public class TokenService : ITokenService
{
    private readonly SymmetricSecurityKey _key;
    
    public TokenService(IConfiguration config)
    {
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));
    }

    public string CreateToken(AppUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName)
        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
```

#### 2. Startup Configuration
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["TokenKey"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
```

#### 3. Login Implementation
```csharp
[HttpPost("login")]
public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
{
    var user = await _context.Users
        .SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

    if (user == null) return Unauthorized("Invalid username");

    using var hmac = new HMACSHA512(user.PasswordSalt);
    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

    for (int i = 0; i < computedHash.Length; i++)
    {
        if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
    }

    return new UserDto
    {
        UserName = user.UserName,
        Token = CreateToken(user)
    };
}
```

### Security Features
1. **JWT Token Security**
   - HMAC-SHA512 signing algorithm
   - 7-day token expiration
   - Secure token validation
   - Protected API endpoints

2. **Password Security**
   - Unique salt per user
   - HMACSHA512 hashing
   - Never stored in plain text
   - Secure password validation

3. **API Security**
   - Protected endpoints with [Authorize] attribute
   - CORS policy configuration
   - HTTPS enabled
   - Input validation

### Authentication Flow
1. **User Registration**
   - Validate input
   - Generate password salt
   - Hash password
   - Create user record
   - Return JWT token

2. **User Login**
   - Validate credentials
   - Verify password hash
   - Generate JWT token
   - Return user data with token

3. **Protected Requests**
   - Validate JWT token
   - Extract user claims
   - Authorize access
   - Process request

### Token Structure
```json
{
  "sub": "user_id",
  "unique_name": "username",
  "exp": "expiration_timestamp"
}
```

### Error Handling
1. **Authentication Errors**
   - 401 Unauthorized for invalid credentials
   - 401 for missing/invalid tokens
   - 401 for expired tokens
   - 403 Forbidden for insufficient permissions

2. **Validation Errors**
   - 400 Bad Request for invalid input
   - 400 for missing required fields
   - 400 for invalid data format

### Best Practices
1. **Security**
   - Use HTTPS
   - Implement CORS
   - Validate all input
   - Use secure password hashing
   - Implement token expiration

2. **Code Organization**
   - Separation of concerns
   - Dependency injection
   - Interface-based design
   - Async/await for performance

3. **Error Handling**
   - Proper exception handling
   - Meaningful error messages
   - Logging of security events
   - Graceful error responses

### Testing Authentication
1. **Unit Tests**
   - Token generation
   - Password hashing
   - User validation
   - Error handling

2. **Integration Tests**
   - Login flow
   - Registration flow
   - Protected endpoints
   - Token validation

3. **Security Tests**
   - Token tampering
   - Password security
   - Input validation
   - Access control

### Configuration
```json
{
  "TokenKey": "super secret unguessable key that is at least 512 bits long for HMAC-SHA512 algorithm to work properly",
  "ApiUrl": "https://localhost:5001"
}
```

### Dependencies
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0-preview.1.24081.2" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.3.1" />
```

### Why HMAC-SHA512?

HMAC-SHA512 is used in two critical areas of the authentication system:

1. **Password Hashing**
   ```csharp
   using var hmac = new HMACSHA512();
   var passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
   var passwordSalt = hmac.Key;
   ```
   - **Why HMAC for Passwords:**
     - HMAC (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret key
     - Each user gets a unique salt (key) for their password hash
     - Makes password cracking extremely difficult even if the database is compromised

2. **JWT Token Signing**
   ```csharp
   var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
   ```
   - **Why HMAC-SHA512 for JWT:**
     - Provides strong cryptographic security
     - SHA-512 offers 512-bit security level
     - HMAC ensures the token hasn't been tampered with
     - Verifies the authenticity of the token
     - Protects against token forgery

#### Security Benefits of HMAC-SHA512:

1. **Cryptographic Strength**
   - 512-bit hash output
   - Strong collision resistance
   - High security margin
   - Industry-standard algorithm


3. **Performance**
   - Efficient implementation
   - Good performance on modern hardware
   - Optimized for security operations
   - Suitable for high-load systems



#### Comparison with Other Algorithms:

1. **vs SHA-256**
   - SHA-512 provides longer hash (512 vs 256 bits)
   - Better security margin
   - More resistant to future attacks
   - Suitable for long-term security

2. **vs bcrypt**
   - HMAC-SHA512 is faster
   - Better for high-frequency operations
   - More suitable for JWT signing
   - Still secure for password hashing with salt

3. **vs PBKDF2**
   - HMAC-SHA512 is more efficient
   - Better for real-time operations
   - Suitable for both hashing and signing
   - Good balance of security and performance

### Common Issues and Solutions
1. **Token Expiration**
   - Implement refresh token mechanism
   - Handle token renewal
   - Clear expired tokens

2. **Password Reset**
   - Secure reset flow
   - Email verification
   - Temporary access tokens

3. **Session Management**
   - Token revocation
   - Multiple device handling
   - Session timeout

### Future Improvements
1. **Security Enhancements**
   - Implement refresh tokens
   - Add two-factor authentication
   - Enhance password policies

2. **Performance**
   - Token caching
   - Optimize validation
   - Reduce token size

3. **Features**
   - Social login integration
   - Remember me functionality
   - Device management 

### Token Validation and Storage

#### 1. Token Validation (Middleware)
```csharp
// BaseApiController.cs
[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    // Base controller with common functionality
}

// Protected Controller Example
[Authorize]
public class PhotosController : BaseApiController
{
    // Protected endpoints requiring authentication
}
```

#### 2. Token Storage Configuration
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data source=datingapp.db"
  },
  "TokenKey": "super secret unguessable key that is at least 512 bits long for HMAC-SHA512 algorithm to work properly",
  "ApiUrl": "https://localhost:5001",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

#### 3. Token Usage in Protected Endpoints

1. **Accessing User Information**
```csharp
// In any controller
var username = User.Identity.Name;
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

2. **Protected Endpoint Examples**
```csharp
// PhotosController.cs
[Authorize]
public class PhotosController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhotoDto>>> GetPhotos()
    {
        var username = User.Identity.Name;
        // ... rest of the implementation
    }
}

// MessagesController.cs
[Authorize]
public class MessagesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages()
    {
        var username = User.Identity.Name;
        // ... rest of the implementation
    }
}
```

3. **Token Storage Locations**

   a. **Backend Storage**:
   - Secret key in `appsettings.json`
   - No token storage (stateless)
   - Token validation through middleware

   b. **Frontend Storage** (Angular):
   ```typescript
   // token.service.ts
   export class TokenService {
     private readonly TOKEN_KEY = 'auth_token';
     private readonly USER_KEY = 'user_data';

     setToken(token: string): void {
       localStorage.setItem(this.TOKEN_KEY, token);
     }

     getToken(): string | null {
       return localStorage.getItem(this.TOKEN_KEY);
     }
   }
   ```

4. **Token Flow in Protected Endpoints**:
   - Request comes with JWT token in header
   - Middleware validates token
   - User claims are extracted
   - Controller can access user information
   - Authorization checks are performed

5. **Security Measures**:
   - Tokens are validated on every request
   - Expired tokens are rejected
   - Invalid tokens return 401
   - Protected endpoints require valid token

6. **Error Handling**:
```csharp
// Example of handling unauthorized access
if (user == null) return Unauthorized("Invalid username");
if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
```

7. **Token Validation Process**:
   - Token signature verification
   - Expiration check
   - Claims validation
   - User existence verification

8. **Best Practices**:
   - Always use [Authorize] attribute
   - Validate user existence
   - Check user permissions
   - Handle token errors gracefully
   - Log security events

### Secret Key Management

#### 1. Secret Key Location
The secret key is stored in `appsettings.json`:
```json
{
  "TokenKey": "super secret unguessable key that is at least 512 bits long for HMAC-SHA512 algorithm to work properly"
}
```

#### 2. Security Considerations
- **Development Environment**:
  - Key is stored in appsettings.json
  - Should be at least 512 bits long for HMAC-SHA512
  - Should be complex and random
  - Should be kept secure and not shared

- **Production Environment**:
  - Never commit the actual secret key to source control
  - Use environment variables or secure key vault
  - Use a different key for each environment
  - Regularly rotate the key

#### 3. Best Practices
- Use a strong, random key
- Keep it secret
- Don't expose it in logs
- Don't share it in documentation
- Use different keys for different environments

#### 4. Key Usage
```csharp
// In TokenService
public class TokenService : ITokenService
{
    private readonly SymmetricSecurityKey _key;
    public TokenService(IConfiguration config)
    {
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));
    }
}

// In Startup Configuration
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["TokenKey"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
```

### Password Security

#### 1. Password Hashing Implementation
```csharp
// In AccountController.cs
[HttpPost("register")]
public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
{
    // Generate unique salt for each user
    using var hmac = new HMACSHA512();

    var user = new AppUser
    {
        UserName = registerDto.Username.ToLower(),
        // Hash password with unique salt
        PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
        PasswordSalt = hmac.Key,
        // ... other user properties
    };
}

// Password verification during login
[HttpPost("login")]
public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
{
    var user = await _context.Users
        .SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

    if (user == null) return Unauthorized("Invalid username");

    // Use the user's unique salt to verify password
    using var hmac = new HMACSHA512(user.PasswordSalt);
    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

    // Compare computed hash with stored hash
    for (int i = 0; i < computedHash.Length; i++)
    {
        if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
    }
}
```

#### 2. Security Features
- **Unique Salt per User**:
  - Each user gets a unique salt
  - Salt is stored with the user record
  - Makes password cracking more difficult

- **HMACSHA512 Hashing**:
  - Uses 512-bit hash output
  - Cryptographically secure
  - Resistant to collision attacks
  - Industry-standard algorithm

- **Password Storage**:
  - Passwords are never stored in plain text
  - Only hash and salt are stored
  - Original password cannot be recovered
  - Secure against database breaches

#### 3. Password Validation
```csharp
// In RegisterDto.cs
public class RegisterDto
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    [StringLength(8, MinimumLength = 4)]
    public string Password { get; set; }
    // ... other properties
}
```

#### 4. Security Best Practices
- Passwords are hashed before storage
- Each user has a unique salt
- Password length requirements enforced
- Secure password comparison
- No plain text password storage
- No password recovery (only reset)

#### 5. Database Storage
```csharp
// In AppUser.cs
public class AppUser
{
    public int Id { get; set; }
    public string UserName { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    // ... other properties
}
```

#### 6. Password Flow
1. **Registration**:
   - User provides password
   - System generates unique salt
   - Password is hashed with salt
   - Hash and salt are stored
   - Original password is discarded

2. **Login**:
   - User provides password
   - System retrieves user's salt
   - Password is hashed with salt
   - Hash is compared with stored hash
   - Original password is never stored

#### 7. Security Benefits
- Protection against database breaches
- Prevention of password reuse attacks
- Resistance to rainbow table attacks
- Secure password verification
- No plain text password exposure

### Password Handling Example

#### 1. Registration Process
Let's say a user registers with password "Namsangel@10":

```csharp
// 1. User submits password "Namsangel@10"
var password = "Namsangel@10";

// 2. System generates a unique salt for this user
using var hmac = new HMACSHA512();
// This creates a random 512-bit key as salt
// Example salt (in bytes): [123, 45, 67, ...] (random for each user)

// 3. Password is hashed with the salt
var passwordBytes = Encoding.UTF8.GetBytes(password);
var passwordHash = hmac.ComputeHash(passwordBytes);
// Result: [234, 56, 78, ...] (512-bit hash)

// 4. Store in database
var user = new AppUser
{
    UserName = "username",
    PasswordHash = passwordHash,  // The hashed password
    PasswordSalt = hmac.Key      // The unique salt
};
```

#### 2. Login Process
When the same user logs in with "Namsangel@10":

```csharp
// 1. User submits password "Namsangel@10"
var loginPassword = "Namsangel@10";

// 2. System retrieves user's unique salt
var userSalt = user.PasswordSalt;  // The same salt from registration

// 3. Create HMAC with user's salt
using var hmac = new HMACSHA512(userSalt);

// 4. Hash the login password with the same salt
var loginPasswordBytes = Encoding.UTF8.GetBytes(loginPassword);
var computedHash = hmac.ComputeHash(loginPasswordBytes);

// 5. Compare hashes
for (int i = 0; i < computedHash.Length; i++)
{
    if (computedHash[i] != user.PasswordHash[i])
        return Unauthorized("Invalid password");
}
```

#### 3. Important Points
- The original password "Namsangel@10" is never stored
- Each user gets a unique salt
- The same password will produce different hashes for different users
- The system can verify the password without storing it
- Even if the database is compromised, the original password cannot be recovered

#### 4. Security Flow
1. **Registration**:
   - Input: "Namsangel@10"
   - Generate unique salt
   - Hash password with salt
   - Store hash and salt
   - Discard original password

2. **Login**:
   - Input: "Namsangel@10"
   - Retrieve user's salt
   - Hash input with same salt
   - Compare with stored hash
   - Discard input password

### Dependency Injection in Backend

#### 1. Service Registration
In `Startup.cs`, services are registered in the `ConfigureServices` method:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Scoped Services
    services.AddScoped<IUserService, UserService>();
    services.AddScoped<ITokenService, TokenService>();
    
    // Repository Registration
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IPhotoRepository, PhotoRepository>();
    
    // Unit of Work
    services.AddScoped<IUnitOfWork, UnitOfWork>();
}
```

#### 2. Service Lifetimes
The application uses different service lifetimes:

1. **Scoped Services** (Per HTTP Request):
   - `ITokenService`: New instance per request
   - `DataContext`: New instance per request

2. **Singleton Services** (Application Lifetime):
   - Configuration (`IConfiguration`)
   - Logging (`ILogger`)

3. **Transient Services** (Per Injection):
   - Various controller dependencies

#### 3. Dependency Injection in Controllers

1. **AccountController**:
```csharp
public class AccountController : BaseApiController
{
    private readonly DataContext _context;
    private readonly IConfiguration _config;

    public AccountController(DataContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }
}
```

2. **PhotosController**:
```csharp
public class PhotosController : BaseApiController
{
    private readonly DataContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _config;

    public PhotosController(DataContext context, IWebHostEnvironment environment, IConfiguration config)
    {
        _context = context;
        _environment = environment;
        _config = config;
    }
}
```

3. **MessagesController**:
```csharp
public class MessagesController : BaseApiController
{
    private readonly DataContext _context;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(DataContext context, ILogger<MessagesController> logger)
    {
        _context = context;
        _logger = logger;
    }
}
```

#### 4. Key Benefits of DI in the System

1. **Loose Coupling**:
   - Controllers depend on interfaces rather than concrete implementations
   - Easy to swap implementations (e.g., different token services)

2. **Testability**:
   - Services can be easily mocked for unit testing
   - Dependencies can be replaced with test implementations

3. **Lifecycle Management**:
   - Proper resource disposal
   - Scoped database contexts
   - Singleton configuration access

4. **Configuration Management**:
   - Centralized configuration injection
   - Environment-specific settings

#### 5. Common Injected Services

1. **DataContext**:
   - Database operations
   - Entity tracking
   - Transaction management

2. **IConfiguration**:
   - Access to appsettings.json
   - Environment variables
   - Connection strings

3. **ITokenService**:
   - JWT token generation
   - Token validation

4. **ILogger**:
   - Application logging
   - Error tracking

5. **IWebHostEnvironment**:
   - File system access
   - Environment information

### Async/Await Patterns in the Application

#### 1. Controller Methods
Most controller methods are async to handle concurrent requests efficiently:

```csharp
// AccountController
[HttpPost("login")]
public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
{
    var user = await _context.Users
        .SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

    if (user == null) return Unauthorized("Invalid username");
    // ... rest of the login logic
}

// PhotosController
[HttpPost("add-photo")]
public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
{
    try
    {
        var username = User.Identity.Name;
        var user = await _context.Users
            .Include(x => x.Photos)
            .SingleOrDefaultAsync(x => x.UserName == username);

        // ... file handling logic
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        // ... rest of the photo upload logic
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Internal server error: {ex.Message}");
    }
}

// MessagesController
[HttpGet]
public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages()
{
    try
    {
        var username = User.Identity.Name;
        var user = await _context.Users
            .Include(x => x.MessagesSent)
            .Include(x => x.MessagesReceived)
            .SingleOrDefaultAsync(x => x.UserName == username);
        // ... rest of the message retrieval logic
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting messages");
        return StatusCode(500, "An error occurred while retrieving messages");
    }
}
```

#### 2. Database Operations
All database operations use async methods:

```csharp
// Reading data
var user = await _context.Users
    .Include(x => x.Photos)
    .SingleOrDefaultAsync(x => x.UserName == username);

// Writing data
_context.Users.Add(user);
await _context.SaveChangesAsync();

// Complex queries
var messages = await _context.Messages
    .Where(m => m.RecipientId == user.Id && !m.RecipientDeleted)
    .OrderByDescending(m => m.MessageSent)
    .ToListAsync();
```

#### 3. File Operations
File handling uses async methods for better performance:

```csharp
// Reading files
using (var stream = new FileStream(filePath, FileMode.Create))
{
    await file.CopyToAsync(stream);
}

// Writing files
await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);
```

#### 4. Error Handling with Async
Proper error handling in async methods:

```