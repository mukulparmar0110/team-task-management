using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        await SeedUserAsync(
            context,
            "System Admin",
            "admin@teamtask.com",
            "Admin@12345",
            UserRole.Admin
        );

        await SeedUserAsync(
            context,
            "Project Manager",
            "manager@teamtask.com",
            "Manager@12345",
            UserRole.Manager
        );

        await SeedUserAsync(
            context,
            "Regular User",
            "user@teamtask.com",
            "User@12345",
            UserRole.User
        );
    }

    private static async Task SeedUserAsync(
        ApplicationDbContext context,
        string fullName,
        string email,
        string password,
        UserRole role)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var existingUser = await context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (existingUser != null)
        {
            return;
        }

        var user = new User
        {
            FullName = fullName,
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Users.Add(user);

        await context.SaveChangesAsync();
    }
}