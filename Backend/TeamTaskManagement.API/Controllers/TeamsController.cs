using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Teams;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TeamsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ---------------------------------------------------------
    // GET: api/Teams
    // Returns teams visible to the current user
    // ---------------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        var isManager = User.IsInRole(nameof(UserRole.Manager));

        IQueryable<Team> query = _context.Teams
            .AsNoTracking();

        if (!isAdmin)
        {
            query = query.Where(team =>
                team.CreatedById == currentUserId ||
                team.Members.Any(member =>
                    member.UserId == currentUserId
                )
            );
        }

        var teams = await query
            .OrderBy(team => team.Name)
            .Select(team => new TeamResponse
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                CreatedAt = team.CreatedAt,
                CreatedById = team.CreatedById,
                CreatedByName = team.CreatedBy.FullName,
                MemberCount = team.Members.Count
            })
            .ToListAsync();

        return Ok(teams);
    }

    // ---------------------------------------------------------
    // GET: api/Teams/{id}
    // ---------------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTeam(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        // Load the team and its required navigation properties
        // directly instead of projecting the Team entity into
        // an anonymous object.
        var team = await _context.Teams
            .AsNoTracking()
            .Include(t => t.CreatedBy)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var isMember = team.Members.Any(member =>
            member.UserId == currentUserId.Value
        );

        if (!isAdmin &&
            team.CreatedById != currentUserId.Value &&
            !isMember)
        {
            return Forbid();
        }

        return Ok(new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            CreatedAt = team.CreatedAt,
            CreatedById = team.CreatedById,
            CreatedByName =
                team.CreatedBy?.FullName ??
                string.Empty,
            MemberCount = team.Members.Count
        });
    }

    // ---------------------------------------------------------
    // POST: api/Teams
    // Admin or Manager
    // ---------------------------------------------------------

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateTeam(
        CreateTeamRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Team name is required."
            });
        }

        var teamExists = await _context.Teams
            .AnyAsync(t =>
                t.Name.ToLower() == name.ToLower());

        if (teamExists)
        {
            return Conflict(new
            {
                message =
                    "A team with this name already exists."
            });
        }

        var team = new Team
        {
            Name = name,

            Description =
                string.IsNullOrWhiteSpace(
                    request.Description)
                    ? null
                    : request.Description.Trim(),

            CreatedAt = DateTime.UtcNow,

            CreatedById =
                currentUserId.Value
        };

        _context.Teams.Add(team);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTeam),
            new { id = team.Id },
            new TeamResponse
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                CreatedAt = team.CreatedAt,
                CreatedById = team.CreatedById,

                CreatedByName =
                    await _context.Users
                        .Where(u =>
                            u.Id == team.CreatedById)
                        .Select(u =>
                            u.FullName)
                        .FirstAsync(),

                MemberCount = 0
            }
        );
    }

    // ---------------------------------------------------------
    // GET: api/Teams/{id}/members
    // ---------------------------------------------------------

    [HttpGet("{id:int}/members")]
    public async Task<IActionResult> GetMembers(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var isAdmin =
            User.IsInRole(nameof(UserRole.Admin));

        var team = await _context.Teams
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(tm =>
                tm.TeamId == id &&
                tm.UserId == currentUserId.Value
            );

        if (!isAdmin &&
            team.CreatedById != currentUserId.Value &&
            !isMember)
        {
            return Forbid();
        }

        var members = await _context.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.TeamId == id)
            .OrderBy(tm => tm.User.FullName)
            .Select(tm => new TeamMemberResponse
            {
                UserId = tm.UserId,
                FullName = tm.User.FullName,
                Email = tm.User.Email,
                Role = tm.User.Role.ToString(),
                JoinedAt = tm.JoinedAt
            })
            .ToListAsync();

        return Ok(members);
    }

    // ---------------------------------------------------------
    // POST: api/Teams/{id}/members
    // Admin or Manager
    // ---------------------------------------------------------

    [HttpPost("{id:int}/members")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> AddMember(
        int id,
        AddTeamMemberRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var isAdmin =
            User.IsInRole(nameof(UserRole.Admin));

        var isManager =
            User.IsInRole(nameof(UserRole.Manager));

        if (!isAdmin &&
            isManager &&
            team.CreatedById != currentUserId.Value)
        {
            return Forbid();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == request.UserId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        if (!user.IsActive)
        {
            return BadRequest(new
            {
                message =
                    "Cannot add an inactive user to a team."
            });
        }

        var alreadyMember =
            await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == id &&
                    tm.UserId == request.UserId);

        if (alreadyMember)
        {
            return Conflict(new
            {
                message =
                    "User is already a member of this team."
            });
        }

        var teamMember = new TeamMember
        {
            TeamId = id,
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow
        };

        _context.TeamMembers.Add(teamMember);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "User added to team successfully."
        });
    }

    // ---------------------------------------------------------
    // DELETE: api/Teams/{id}/members/{userId}
    // Admin or Manager
    // ---------------------------------------------------------

    [HttpDelete("{id:int}/members/{userId:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> RemoveMember(
        int id,
        int userId)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var isAdmin =
            User.IsInRole(nameof(UserRole.Admin));

        var isManager =
            User.IsInRole(nameof(UserRole.Manager));

        if (!isAdmin &&
            isManager &&
            team.CreatedById != currentUserId.Value)
        {
            return Forbid();
        }

        var teamMember =
            await _context.TeamMembers
                .FirstOrDefaultAsync(tm =>
                    tm.TeamId == id &&
                    tm.UserId == userId);

        if (teamMember == null)
        {
            return NotFound(new
            {
                message =
                    "User is not a member of this team."
            });
        }

        _context.TeamMembers.Remove(teamMember);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "User removed from team successfully."
        });
    }

    // ---------------------------------------------------------
    // DELETE: api/Teams/{id}
    // Admin only
    // ---------------------------------------------------------

    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var hasTasks = await _context.Tasks
            .AnyAsync(t => t.TeamId == id);

        if (hasTasks)
        {
            return Conflict(new
            {
                message =
                    "Cannot delete a team that has tasks assigned to it."
            });
        }

        _context.Teams.Remove(team);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Team deleted successfully."
        });
    }

    // ---------------------------------------------------------
    // Helper
    // ---------------------------------------------------------

    private int? GetCurrentUserId()
    {
        var userId =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

        return int.TryParse(
            userId,
            out var id)
            ? id
            : null;
    }
}