using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Tasks;
using TeamTaskManagement.API.Interfaces;
using TeamTaskManagement.API.Models;

// Resolve ambiguity between:
// TeamTaskManagement.API.Models.TaskStatus
// and System.Threading.Tasks.TaskStatus
using TaskStatus = TeamTaskManagement.API.Models.TaskStatus;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public TasksController(
        ApplicationDbContext context,
        INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    // =========================================================
    // GET: api/Tasks
    // Get tasks with role-based visibility, filtering and
    // pagination.
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetTasks(
        [FromQuery] TaskFilterRequest filter,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        // -----------------------------------------------------
        // Protect API from invalid pagination values.
        // -----------------------------------------------------

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        var isManager = User.IsInRole(nameof(UserRole.Manager));

        IQueryable<TaskItem> query = _context.Tasks
            .AsNoTracking();

        // -----------------------------------------------------
        // Role-based task visibility
        // -----------------------------------------------------

        if (!isAdmin && !isManager)
        {
            // Regular users can only see tasks assigned to them.
            query = query.Where(task =>
                task.AssignedToId == currentUserId.Value
            );
        }
        else if (isManager)
        {
            // Managers can see tasks belonging to teams
            // they created or teams where they are members.
            query = query.Where(task =>
                task.Team != null &&
                (
                    task.Team.CreatedById == currentUserId.Value ||
                    task.Team.Members.Any(member =>
                        member.UserId == currentUserId.Value
                    )
                )
            );
        }

        // -----------------------------------------------------
        // Filtering
        // -----------------------------------------------------

        if (filter.Status.HasValue)
        {
            query = query.Where(task =>
                task.Status == filter.Status.Value
            );
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(task =>
                task.Priority == filter.Priority.Value
            );
        }

        if (filter.DueAfter.HasValue)
        {
            query = query.Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value >= filter.DueAfter.Value
            );
        }

        if (filter.DueBefore.HasValue)
        {
            query = query.Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value <= filter.DueBefore.Value
            );
        }

        if (filter.AssignedToId.HasValue)
        {
            query = query.Where(task =>
                task.AssignedToId == filter.AssignedToId.Value
            );
        }

        if (filter.TeamId.HasValue)
        {
            query = query.Where(task =>
                task.TeamId == filter.TeamId.Value
            );
        }

        // -----------------------------------------------------
        // Count before pagination
        // -----------------------------------------------------

        var totalCount = await query.CountAsync();

        // -----------------------------------------------------
        // Apply pagination
        // -----------------------------------------------------

        var tasks = await query
            .OrderByDescending(task => task.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(task => new TaskResponse
            {
                Id = task.Id,

                Title = task.Title,

                Description = task.Description,

                Priority = task.Priority,

                Status = task.Status,

                DueDate = task.DueDate,

                CreatedById = task.CreatedById,

                CreatedByName = task.CreatedBy.FullName,

                AssignedToId = task.AssignedToId,

                AssignedToName = task.AssignedTo != null
                    ? task.AssignedTo.FullName
                    : null,

                TeamId = task.TeamId,

                TeamName = task.Team != null
                    ? task.Team.Name
                    : null,

                CreatedAt = task.CreatedAt,

                UpdatedAt = task.UpdatedAt
            })
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(
            totalCount / (double)pageSize
        );

        return Ok(new TaskListResponse
        {
            Tasks = tasks,

            TotalCount = totalCount,

            Page = page,

            PageSize = pageSize,

            TotalPages = totalPages
        });
    }

    // =========================================================
    // GET: api/Tasks/{id}
    // Get a specific task.
    // =========================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var task = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Team)
            .ThenInclude(team => team!.Members)
            .Where(t => t.Id == id)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        if (!CanAccessTask(
                task,
                currentUserId.Value,
                User.IsInRole(nameof(UserRole.Admin))))
        {
            return Forbid();
        }

        return Ok(MapTask(task));
    }

    // =========================================================
    // POST: api/Tasks
    // Create a new task.
    // Admin or Manager only.
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateTask(
        CreateTaskRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        // -----------------------------------------------------
        // Validate title
        // -----------------------------------------------------

        var title = request.Title.Trim();

        if (string.IsNullOrWhiteSpace(title))
        {
            return BadRequest(new
            {
                message = "Task title is required."
            });
        }

        // -----------------------------------------------------
        // Validate team
        // -----------------------------------------------------

        var team = await _context.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t =>
                t.Id == request.TeamId
            );

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found."
            });
        }

        var isManager = User.IsInRole(nameof(UserRole.Manager));

        // -----------------------------------------------------
        // Manager team authorization
        // -----------------------------------------------------

        if (isManager &&
            team.CreatedById != currentUserId.Value &&
            !team.Members.Any(member =>
                member.UserId == currentUserId.Value))
        {
            return Forbid();
        }

        // -----------------------------------------------------
        // Validate assignee
        // -----------------------------------------------------

        if (request.AssignedToId.HasValue)
        {
            var assignee = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == request.AssignedToId.Value
                );

            if (assignee == null)
            {
                return NotFound(new
                {
                    message = "Assigned user not found."
                });
            }

            if (!assignee.IsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Cannot assign a task to an inactive user."
                });
            }

            // The assignee must belong to the selected team.
            var isMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == request.TeamId &&
                    tm.UserId == request.AssignedToId.Value
                );

            if (!isMember)
            {
                return BadRequest(new
                {
                    message =
                        "The assigned user must be a member of the selected team."
                });
            }
        }

        // -----------------------------------------------------
        // Create task
        // -----------------------------------------------------

        var task = new TaskItem
        {
            Title = title,

            Description =
                string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),

            Priority = request.Priority,

            Status = TaskStatus.ToDo,

            DueDate = request.DueDate,

            CreatedById = currentUserId.Value,

            AssignedToId = request.AssignedToId,

            TeamId = request.TeamId,

            CreatedAt = DateTime.UtcNow,

            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        // -----------------------------------------------------
        // Create assignment notification
        // -----------------------------------------------------

        if (task.AssignedToId.HasValue)
        {
            await _notificationService
                .CreateTaskAssignedNotificationAsync(
                    task.AssignedToId.Value,
                    task.Id,
                    task.Title
                );
        }

        return CreatedAtAction(
            nameof(GetTask),
            new { id = task.Id },
            await BuildTaskResponse(task.Id)
        );
    }

    // =========================================================
    // PUT: api/Tasks/{id}
    // Update task details.
    // Admin or Manager only.
    // =========================================================

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateTask(
        int id,
        UpdateTaskRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var task = await _context.Tasks
            .Include(t => t.Team)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        var isManager = User.IsInRole(nameof(UserRole.Manager));

        // -----------------------------------------------------
        // Manager authorization
        // -----------------------------------------------------

        if (isManager)
        {
            if (task.Team == null)
            {
                return Forbid();
            }

            var isMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == task.TeamId &&
                    tm.UserId == currentUserId.Value
                );

            if (task.Team.CreatedById != currentUserId.Value &&
                !isMember)
            {
                return Forbid();
            }
        }

        // -----------------------------------------------------
        // Validate title
        // -----------------------------------------------------

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Task title is required."
            });
        }

        // -----------------------------------------------------
        // Remember previous assignee
        // -----------------------------------------------------

        var previousAssignedToId = task.AssignedToId;

        // -----------------------------------------------------
        // Validate new assignee
        // -----------------------------------------------------

        if (request.AssignedToId.HasValue)
        {
            var assignee = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == request.AssignedToId.Value
                );

            if (assignee == null)
            {
                return NotFound(new
                {
                    message = "Assigned user not found."
                });
            }

            if (!assignee.IsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Cannot assign a task to an inactive user."
                });
            }

            if (task.TeamId.HasValue)
            {
                var isMember = await _context.TeamMembers
                    .AnyAsync(tm =>
                        tm.TeamId == task.TeamId.Value &&
                        tm.UserId == request.AssignedToId.Value
                    );

                if (!isMember)
                {
                    return BadRequest(new
                    {
                        message =
                            "The assigned user must be a member of the task team."
                    });
                }
            }
        }

        // -----------------------------------------------------
        // Update task
        // -----------------------------------------------------

        task.Title = request.Title.Trim();

        task.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();

        task.Priority = request.Priority;

        task.DueDate = request.DueDate;

        task.AssignedToId = request.AssignedToId;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // -----------------------------------------------------
        // Create notification when assignment changes
        // -----------------------------------------------------

        var assignmentChanged =
            previousAssignedToId != task.AssignedToId;

        if (assignmentChanged &&
            task.AssignedToId.HasValue)
        {
            await _notificationService
                .CreateTaskAssignedNotificationAsync(
                    task.AssignedToId.Value,
                    task.Id,
                    task.Title
                );
        }

        return Ok(await BuildTaskResponse(task.Id));
    }

    // =========================================================
    // PUT: api/Tasks/{id}/status
    // Update task status.
    //
    // Admin:
    //     Can update any task.
    //
    // Manager:
    //     Can update tasks belonging to their team.
    //
    // User:
    //     Can update status of tasks assigned to them.
    // =========================================================

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        UpdateTaskStatusRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var task = await _context.Tasks
            .Include(t => t.Team)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        var isManager = User.IsInRole(nameof(UserRole.Manager));

        var isAssignedUser =
            task.AssignedToId == currentUserId.Value;

        var isTeamMember =
            task.TeamId.HasValue &&
            await _context.TeamMembers.AnyAsync(tm =>
                tm.TeamId == task.TeamId.Value &&
                tm.UserId == currentUserId.Value
            );

        // -----------------------------------------------------
        // Authorization
        // -----------------------------------------------------

        if (!isAdmin &&
            !isAssignedUser &&
            !(isManager && isTeamMember))
        {
            return Forbid();
        }

        // -----------------------------------------------------
        // Remember previous status
        // -----------------------------------------------------

        var previousStatus = task.Status;

        // -----------------------------------------------------
        // Update status
        // -----------------------------------------------------

        task.Status = request.Status;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // -----------------------------------------------------
        // Create status-change notifications
        // -----------------------------------------------------

        var statusChanged =
            previousStatus != task.Status;

        if (statusChanged)
        {
            var changedByName =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.Name
                )?.Value
                ?? "A user";

            // Notify the task creator when someone else changes
            // the task status.
            if (task.CreatedById != currentUserId.Value)
            {
                await _notificationService
                    .CreateTaskStatusChangedNotificationAsync(
                        task.CreatedById,
                        task.Id,
                        task.Title,
                        task.Status,
                        changedByName
                    );
            }

            // Notify the assigned user when someone else changes
            // the task status.
            if (task.AssignedToId.HasValue &&
                task.AssignedToId.Value != currentUserId.Value &&
                task.AssignedToId.Value != task.CreatedById)
            {
                await _notificationService
                    .CreateTaskStatusChangedNotificationAsync(
                        task.AssignedToId.Value,
                        task.Id,
                        task.Title,
                        task.Status,
                        changedByName
                    );
            }
        }

        return Ok(await BuildTaskResponse(task.Id));
    }

    // =========================================================
    // DELETE: api/Tasks/{id}
    // Admin or Manager only.
    // =========================================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var task = await _context.Tasks
            .Include(t => t.Team)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));

        // -----------------------------------------------------
        // Manager authorization
        // -----------------------------------------------------

        if (!isAdmin)
        {
            if (task.Team == null)
            {
                return Forbid();
            }

            var isTeamMember = await _context.TeamMembers
                .AnyAsync(tm =>
                    tm.TeamId == task.TeamId &&
                    tm.UserId == currentUserId.Value
                );

            if (task.Team.CreatedById != currentUserId.Value &&
                !isTeamMember)
            {
                return Forbid();
            }
        }

        // -----------------------------------------------------
        // Delete
        // -----------------------------------------------------

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Task deleted successfully."
        });
    }

    // =========================================================
    // Helper: Build Task Response
    // =========================================================

    private async Task<TaskResponse> BuildTaskResponse(int taskId)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Where(task => task.Id == taskId)
            .Select(task => new TaskResponse
            {
                Id = task.Id,

                Title = task.Title,

                Description = task.Description,

                Priority = task.Priority,

                Status = task.Status,

                DueDate = task.DueDate,

                CreatedById = task.CreatedById,

                CreatedByName = task.CreatedBy.FullName,

                AssignedToId = task.AssignedToId,

                AssignedToName = task.AssignedTo != null
                    ? task.AssignedTo.FullName
                    : null,

                TeamId = task.TeamId,

                TeamName = task.Team != null
                    ? task.Team.Name
                    : null,

                CreatedAt = task.CreatedAt,

                UpdatedAt = task.UpdatedAt
            })
            .FirstAsync();
    }

    // =========================================================
    // Helper: Map Task
    // =========================================================

    private static TaskResponse MapTask(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,

            Title = task.Title,

            Description = task.Description,

            Priority = task.Priority,

            Status = task.Status,

            DueDate = task.DueDate,

            CreatedById = task.CreatedById,

            CreatedByName =
                task.CreatedBy?.FullName ?? string.Empty,

            AssignedToId = task.AssignedToId,

            AssignedToName =
                task.AssignedTo?.FullName,

            TeamId = task.TeamId,

            TeamName =
                task.Team?.Name,

            CreatedAt = task.CreatedAt,

            UpdatedAt = task.UpdatedAt
        };
    }

    // =========================================================
    // Helper: Check task access
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
    // Helper: Get Current User ID
    // =========================================================

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