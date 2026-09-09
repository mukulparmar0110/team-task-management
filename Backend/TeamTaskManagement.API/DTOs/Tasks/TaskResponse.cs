using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Tasks;

public class TaskResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public TeamTaskManagement.API.Models.TaskStatus Status { get; set; }

    public DateTime? DueDate { get; set; }

    public int CreatedById { get; set; }

    public string CreatedByName { get; set; } = string.Empty;

    public int? AssignedToId { get; set; }

    public string? AssignedToName { get; set; }

    public int? TeamId { get; set; }

    public string? TeamName { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}