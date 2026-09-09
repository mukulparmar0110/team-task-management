using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.Helpers;
using TeamTaskManagement.API.Interfaces;
using TeamTaskManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// Database
// ---------------------------------------------------------

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ---------------------------------------------------------
// Controllers + JSON Configuration
// ---------------------------------------------------------

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
    });

// ---------------------------------------------------------
// JWT Authentication
// ---------------------------------------------------------

var jwtSettings = builder.Configuration.GetSection("Jwt");

var jwtSecretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException(
        "JWT SecretKey is not configured."
    );

var jwtIssuer = jwtSettings["Issuer"]
    ?? throw new InvalidOperationException(
        "JWT Issuer is not configured."
    );

var jwtAudience = jwtSettings["Audience"]
    ?? throw new InvalidOperationException(
        "JWT Audience is not configured."
    );

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecretKey)
            ),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------
// Application Services
// ---------------------------------------------------------

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<JwtHelper>();

// ---------------------------------------------------------
// Swagger
// ---------------------------------------------------------

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TeamTaskManagement.API",
        Version = "v1",
        Description = "Role-Based Team Task Management System API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description =
            "Enter your JWT token. Example: Bearer eyJhbGciOiJIUzI1NiIs..."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    document
                )
            ] = new List<string>()
        });
});

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------

var frontendUrl = builder.Configuration["FrontendUrl"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .WithOrigins(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            if (string.IsNullOrWhiteSpace(frontendUrl))
            {
                throw new InvalidOperationException(
                    "FrontendUrl is not configured for production."
                );
            }

            policy
                .WithOrigins(frontendUrl)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

// ---------------------------------------------------------
// Build Application
// ---------------------------------------------------------

var app = builder.Build();

// ---------------------------------------------------------
// Database Seeder
// ---------------------------------------------------------

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    await DbSeeder.SeedAsync(dbContext);
}

// ---------------------------------------------------------
// HTTP Request Pipeline
// ---------------------------------------------------------

// Swagger is available in both Development and Production
// so the API can be documented and tested from the deployed
// Render environment as well.

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();