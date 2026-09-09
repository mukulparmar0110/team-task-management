using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Tasks;

public class TaskFilterRequest
{
    public TeamTaskManagement.API.Models.TaskStatus? Status { get; set; }

    public TaskPriority? Priority { get; set; }

    public DateTime? DueBefore { get; set; }

    public DateTime? DueAfter { get; set; }

    public int? AssignedToId { get; set; }

    public int? TeamId { get; set; }
}