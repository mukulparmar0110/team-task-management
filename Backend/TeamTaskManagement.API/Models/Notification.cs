using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.Models;

public enum NotificationType
{
    TaskAssigned,
    TaskStatusChanged
}

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? TaskId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public NotificationType Type { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public TaskItem? Task { get; set; }
}