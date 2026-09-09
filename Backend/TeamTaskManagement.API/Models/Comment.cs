using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.Models;

public class Comment
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public TaskItem Task { get; set; } = null!;

    public User User { get; set; } = null!;
}