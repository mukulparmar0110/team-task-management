using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Users;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ---------------------------------------------------------
    // GET: api/Users
    // Admin only
    // ---------------------------------------------------------

    [HttpGet]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.FullName)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    // ---------------------------------------------------------
    // GET: api/Users/{id}
    // Admin or the user themselves
    // ---------------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var currentUserId = GetCurrentUserId();

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        if (!isAdmin && currentUserId != id)
        {
            return Forbid();
        }

        var user = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    // ---------------------------------------------------------
    // PUT: api/Users/{id}/role
    // Admin only
    // ---------------------------------------------------------

    [HttpPut("{id:int}/role")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> UpdateRole(
        int id,
        UpdateUserRoleRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        user.Role = request.Role;

        await _context.SaveChangesAsync();

        return Ok(new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    // ---------------------------------------------------------
    // PUT: api/Users/{id}/status
    // Admin only
    // ---------------------------------------------------------

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromQuery] bool isActive)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        user.IsActive = isActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = isActive
                ? "User activated successfully."
                : "User deactivated successfully."
        });
    }

    // ---------------------------------------------------------
    // Helper
    // ---------------------------------------------------------

    private int? GetCurrentUserId()
    {
        var userId = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        return int.TryParse(userId, out var id)
            ? id
            : null;
    }
}