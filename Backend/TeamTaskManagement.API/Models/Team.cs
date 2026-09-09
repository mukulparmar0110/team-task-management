using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.Models;

public class Team
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CreatedById { get; set; }

    public User CreatedBy { get; set; } = null!;

    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}