using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Notifications;

public class NotificationResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? TaskId { get; set; }

    public string Message { get; set; } = string.Empty;

    public NotificationType Type { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }
}