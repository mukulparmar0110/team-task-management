using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.API.Data;
using TeamTaskManagement.API.DTOs.Notifications;
using TeamTaskManagement.API.Interfaces;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;

    public NotificationService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ---------------------------------------------------------
    // Create task assignment notification
    // ---------------------------------------------------------

    public async Task<NotificationResponse>
        CreateTaskAssignedNotificationAsync(
            int userId,
            int taskId,
            string taskTitle)
    {
        var notification = new Notification
        {
            UserId = userId,
            TaskId = taskId,
            Message = $"You have been assigned a new task: \"{taskTitle}\".",
            Type = NotificationType.TaskAssigned,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return MapNotification(notification);
    }

    // ---------------------------------------------------------
    // Create task status change notification
    // ---------------------------------------------------------

    public async Task<NotificationResponse>
        CreateTaskStatusChangedNotificationAsync(
            int userId,
            int taskId,
            string taskTitle,
            TeamTaskManagement.API.Models.TaskStatus status,
            string changedByName)
    {
        var notification = new Notification
        {
            UserId = userId,
            TaskId = taskId,
            Message =
                $"Task \"{taskTitle}\" status was changed to {status} by {changedByName}.",
            Type = NotificationType.TaskStatusChanged,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return MapNotification(notification);
    }

    // ---------------------------------------------------------
    // Get user notifications
    // ---------------------------------------------------------

    public async Task<List<NotificationResponse>>
        GetUserNotificationsAsync(
            int userId,
            bool unreadOnly = false)
    {
        var query = _context.Notifications
            .AsNoTracking()
            .Where(notification =>
                notification.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(notification =>
                !notification.IsRead);
        }

        var notifications = await query
            .OrderByDescending(notification =>
                notification.CreatedAt)
            .ToListAsync();

        return notifications
            .Select(MapNotification)
            .ToList();
    }

    // ---------------------------------------------------------
    // Mark notification as read
    // ---------------------------------------------------------

    public async Task<bool> MarkAsReadAsync(
        int notificationId,
        int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(notification =>
                notification.Id == notificationId &&
                notification.UserId == userId);

        if (notification == null)
        {
            return false;
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;

            await _context.SaveChangesAsync();
        }

        return true;
    }

    // ---------------------------------------------------------
    // Mark all notifications as read
    // ---------------------------------------------------------

    public async Task<int> MarkAllAsReadAsync(
        int userId)
    {
        var notifications = await _context.Notifications
            .Where(notification =>
                notification.UserId == userId &&
                !notification.IsRead)
            .ToListAsync();

        if (notifications.Count == 0)
        {
            return 0;
        }

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return notifications.Count;
    }

    // ---------------------------------------------------------
    // Mapper
    // ---------------------------------------------------------

    private static NotificationResponse MapNotification(
        Notification notification)
    {
        return new NotificationResponse
        {
            Id = notification.Id,
            UserId = notification.UserId,
            TaskId = notification.TaskId,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}