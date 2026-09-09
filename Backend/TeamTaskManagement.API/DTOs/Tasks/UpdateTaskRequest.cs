using System.ComponentModel.DataAnnotations;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Tasks;

public class UpdateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public int? AssignedToId { get; set; }
}