using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Comments;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET: api/Comments/task/{taskId}
    // =========================================================

    [HttpGet("task/{taskId:int}")]
    public async Task<IActionResult> GetTaskComments(int taskId)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var task = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Team)
            .ThenInclude(team => team!.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        if (!CanAccessTask(
                task,
                currentUserId.Value,
                isAdmin))
        {
            return Forbid();
        }

        var comments = await _context.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentResponse
            {
                Id = c.Id,
                TaskId = c.TaskId,
                UserId = c.UserId,
                UserName = c.User.FullName,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    // =========================================================
    // POST: api/Comments/task/{taskId}
    // =========================================================

    [HttpPost("task/{taskId:int}")]
    public async Task<IActionResult> CreateComment(
        int taskId,
        [FromBody] CommentCreateRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (request == null ||
            string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new
            {
                message = "Comment content is required."
            });
        }

        var task = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Team)
            .ThenInclude(team => team!.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        if (!CanAccessTask(
                task,
                currentUserId.Value,
                isAdmin))
        {
            return Forbid();
        }

        var comment = new Comment
        {
            TaskId = taskId,
            UserId = currentUserId.Value,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        _context.Comments.Add(comment);

        await _context.SaveChangesAsync();

        await _context.Entry(comment)
            .Reference(c => c.User)
            .LoadAsync();

        var response = MapComment(comment);

        return CreatedAtAction(
            nameof(GetTaskComments),
            new { taskId },
            response
        );
    }

    // =========================================================
    // PUT: api/Comments/{id}
    // =========================================================

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateComment(
        int id,
        [FromBody] CommentUpdateRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        if (request == null ||
            string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new
            {
                message = "Comment content is required."
            });
        }

        var comment = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Task)
            .ThenInclude(t => t!.Team)
            .ThenInclude(team => team!.Members)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
        {
            return NotFound(new
            {
                message = "Comment not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        var isCommentOwner =
            comment.UserId == currentUserId.Value;

        var isManager =
            User.IsInRole(nameof(UserRole.Manager));

        var isTeamManager =
            isManager &&
            comment.Task?.Team?.CreatedById ==
            currentUserId.Value;

        if (!isAdmin &&
            !isCommentOwner &&
            !isTeamManager)
        {
            return Forbid();
        }

        comment.Content = request.Content.Trim();
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapComment(comment));
    }

    // =========================================================
    // DELETE: api/Comments/{id}
    // =========================================================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var comment = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Task)
            .ThenInclude(t => t!.Team)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
        {
            return NotFound(new
            {
                message = "Comment not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        var isCommentOwner =
            comment.UserId == currentUserId.Value;

        var isManager =
            User.IsInRole(nameof(UserRole.Manager));

        var isTeamManager =
            isManager &&
            comment.Task?.Team?.CreatedById ==
            currentUserId.Value;

        if (!isAdmin &&
            !isCommentOwner &&
            !isTeamManager)
        {
            return Forbid();
        }

        _context.Comments.Remove(comment);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Comment deleted successfully."
        });
    }

    // =========================================================
    // Helper: Check current user's access to a task
    // =========================================================

    private static bool CanAccessTask(
        TaskItem task,
        int currentUserId,
        bool isAdmin)
    {
        if (isAdmin)
        {
            return true;
        }

        var isAssignedUser =
            task.AssignedToId == currentUserId;

        var isTeamCreator =
            task.Team?.CreatedById == currentUserId;

        var isTeamMember =
            task.Team?.Members.Any(member =>
                member.UserId == currentUserId) == true;

        return isAssignedUser ||
               isTeamCreator ||
               isTeamMember;
    }

    // =========================================================
    // Helper: Get current logged-in user ID
    // =========================================================

    private int? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    // =========================================================
    // Helper: Map Comment → Response DTO
    // =========================================================

    private static CommentResponse MapComment(Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = comment.User?.FullName ?? string.Empty,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}