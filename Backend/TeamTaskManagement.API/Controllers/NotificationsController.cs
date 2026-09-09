using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamTaskManagement.API.Interfaces;

namespace TeamTaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(
        INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // ---------------------------------------------------------
    // GET: api/Notifications
    // ---------------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var notifications =
            await _notificationService.GetUserNotificationsAsync(
                currentUserId.Value
            );

        return Ok(notifications);
    }

    // ---------------------------------------------------------
    // GET: api/Notifications/unread
    // ---------------------------------------------------------

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnreadNotifications()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var notifications =
            await _notificationService.GetUserNotificationsAsync(
                currentUserId.Value,
                unreadOnly: true
            );

        return Ok(notifications);
    }

    // ---------------------------------------------------------
    // PUT: api/Notifications/{id}/read
    // ---------------------------------------------------------

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var success =
            await _notificationService.MarkAsReadAsync(
                id,
                currentUserId.Value
            );

        if (!success)
        {
            return NotFound(new
            {
                message = "Notification not found."
            });
        }

        return Ok(new
        {
            message = "Notification marked as read."
        });
    }

    // ---------------------------------------------------------
    // PUT: api/Notifications/read-all
    // ---------------------------------------------------------

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var count =
            await _notificationService.MarkAllAsReadAsync(
                currentUserId.Value
            );

        return Ok(new
        {
            message = "All notifications marked as read.",
            updatedCount = count
        });
    }

    // ---------------------------------------------------------
    // Current User Helper
    // ---------------------------------------------------------

    private int? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            return null;
        }

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return userId;
    }
}