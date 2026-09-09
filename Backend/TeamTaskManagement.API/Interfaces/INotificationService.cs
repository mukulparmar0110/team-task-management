using TeamTaskManagement.API.DTOs.Notifications;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.Interfaces;

public interface INotificationService
{
    // ---------------------------------------------------------
    // Create task assignment notification
    // ---------------------------------------------------------

    Task<NotificationResponse> CreateTaskAssignedNotificationAsync(
        int userId,
        int taskId,
        string taskTitle
    );

    // ---------------------------------------------------------
    // Create task status change notification
    // ---------------------------------------------------------

    Task<NotificationResponse> CreateTaskStatusChangedNotificationAsync(
        int userId,
        int taskId,
        string taskTitle,
       TeamTaskManagement.API.Models.TaskStatus status,
        string changedByName
    );

    // ---------------------------------------------------------
    // Get user notifications
    // ---------------------------------------------------------

    Task<List<NotificationResponse>> GetUserNotificationsAsync(
        int userId,
        bool unreadOnly = false
    );

    // ---------------------------------------------------------
    // Mark notification as read
    // ---------------------------------------------------------

    Task<bool> MarkAsReadAsync(
        int notificationId,
        int userId
    );

    // ---------------------------------------------------------
    // Mark all notifications as read
    // ---------------------------------------------------------

    Task<int> MarkAllAsReadAsync(
        int userId
    );
}