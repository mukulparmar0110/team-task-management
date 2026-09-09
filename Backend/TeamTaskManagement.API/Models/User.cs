using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.Models;

public enum UserRole
{
    Admin,
    Manager,
    User
}

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.User;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public ICollection<Team> CreatedTeams { get; set; } = new List<Team>();

    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();

    public ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();

    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}