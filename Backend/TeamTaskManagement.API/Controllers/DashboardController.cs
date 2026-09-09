using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Dashboard;
using TeamTaskManagement.API.Models;
using TaskStatus = TeamTaskManagement.API.Models.TaskStatus;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard(
        [FromQuery] TaskStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] DateTime? dueAfter = null,
        [FromQuery] DateTime? dueBefore = null,
        [FromQuery] int? teamId = null,
        [FromQuery] int? assignedToId = null)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole(nameof(UserRole.Admin));
        var isManager = User.IsInRole(nameof(UserRole.Manager));

        IQueryable<TaskItem> query = _context.Tasks
            .AsNoTracking();

        // ---------------------------------------------------------
        // ROLE-BASED TASK VISIBILITY
        // ---------------------------------------------------------

        if (isAdmin)
        {
            // Admin can see all tasks.
        }
        else if (isManager)
        {
            // Manager can see tasks from teams they created
            // or teams where they are a member.
            query = query.Where(task =>
                task.Team != null &&
                (
                    task.Team.CreatedById == currentUserId.Value ||
                    task.Team.Members.Any(member =>
                        member.UserId == currentUserId.Value)
                )
            );
        }
        else
        {
            // Normal users can only see tasks assigned to themselves.
            query = query.Where(task =>
                task.AssignedToId == currentUserId.Value);
        }

        // ---------------------------------------------------------
        // FILTERS
        // ---------------------------------------------------------

        if (status.HasValue)
        {
            query = query.Where(task =>
                task.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(task =>
                task.Priority == priority.Value);
        }

        if (dueAfter.HasValue)
        {
            query = query.Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value >= dueAfter.Value);
        }

        if (dueBefore.HasValue)
        {
            query = query.Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value <= dueBefore.Value);
        }

        if (teamId.HasValue)
        {
            query = query.Where(task =>
                task.TeamId == teamId.Value);
        }

        if (assignedToId.HasValue)
        {
            query = query.Where(task =>
                task.AssignedToId == assignedToId.Value);
        }

        // ---------------------------------------------------------
        // BASIC COUNTS
        // ---------------------------------------------------------

        var totalTasks = await query.CountAsync();

        var toDoTasks = await query.CountAsync(task =>
            task.Status == TaskStatus.ToDo);

        var inProgressTasks = await query.CountAsync(task =>
            task.Status == TaskStatus.InProgress);

        var doneTasks = await query.CountAsync(task =>
            task.Status == TaskStatus.Done);

        // ---------------------------------------------------------
        // OVERDUE TASKS
        // ---------------------------------------------------------

        var now = DateTime.UtcNow;

        var overdueTasks = await query.CountAsync(task =>
            task.DueDate.HasValue &&
            task.DueDate.Value < now &&
            task.Status != TaskStatus.Done);

        // ---------------------------------------------------------
        // PRIORITY COUNTS
        // ---------------------------------------------------------

        var highPriorityTasks = await query.CountAsync(task =>
            task.Priority == TaskPriority.High);

        var criticalPriorityTasks = await query.CountAsync(task =>
            task.Priority == TaskPriority.Critical);

        // ---------------------------------------------------------
        // STATUS SUMMARY
        // ---------------------------------------------------------

        var statusSummary = await query
            .GroupBy(task => task.Status)
            .Select(group => new DashboardStatusSummary
            {
                Status = group.Key,
                Count = group.Count()
            })
            .OrderBy(summary => summary.Status)
            .ToListAsync();

        // ---------------------------------------------------------
        // USER SUMMARY
        // ---------------------------------------------------------

        var userSummary = await query
            .Where(task => task.AssignedToId.HasValue)
            .GroupBy(task => new
            {
                UserId = task.AssignedToId!.Value,
                UserName = task.AssignedTo!.FullName
            })
            .Select(group => new DashboardUserSummary
            {
                UserId = group.Key.UserId,

                UserName = group.Key.UserName,

                TotalTasks = group.Count(),

                ToDoTasks = group.Count(task =>
                    task.Status == TaskStatus.ToDo),

                InProgressTasks = group.Count(task =>
                    task.Status == TaskStatus.InProgress),

                DoneTasks = group.Count(task =>
                    task.Status == TaskStatus.Done),

                OverdueTasks = group.Count(task =>
                    task.DueDate.HasValue &&
                    task.DueDate.Value < now &&
                    task.Status != TaskStatus.Done)
            })
            .OrderByDescending(user => user.TotalTasks)
            .ThenBy(user => user.UserName)
            .ToListAsync();

        // ---------------------------------------------------------
        // FINAL RESPONSE
        // ---------------------------------------------------------

        var response = new DashboardResponse
        {
            TotalTasks = totalTasks,

            ToDoTasks = toDoTasks,

            InProgressTasks = inProgressTasks,

            DoneTasks = doneTasks,

            OverdueTasks = overdueTasks,

            HighPriorityTasks = highPriorityTasks,

            CriticalPriorityTasks = criticalPriorityTasks,

            StatusSummary = statusSummary,

            UserSummary = userSummary
        };

        return Ok(response);
    }

    // -------------------------------------------------------------
    // GET CURRENT USER ID FROM JWT
    // -------------------------------------------------------------

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