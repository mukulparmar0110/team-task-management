using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.Models;

public enum TaskStatus
{
    ToDo,
    InProgress,
    Done
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public TaskStatus Status { get; set; } = TaskStatus.ToDo;

    public DateTime? DueDate { get; set; }

    public int CreatedById { get; set; }

    public int? AssignedToId { get; set; }

    public int? TeamId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedBy { get; set; } = null!;

    public User? AssignedTo { get; set; }

    public Team? Team { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}