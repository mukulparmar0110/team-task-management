using TaskStatus = TeamTaskManagement.API.Models.TaskStatus;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Dashboard;

public class DashboardResponse
{
    public int TotalTasks { get; set; }

    public int ToDoTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int DoneTasks { get; set; }

    public int OverdueTasks { get; set; }

    public int HighPriorityTasks { get; set; }

    public int CriticalPriorityTasks { get; set; }

    public List<DashboardStatusSummary> StatusSummary { get; set; }
        = new();

    public List<DashboardUserSummary> UserSummary { get; set; }
        = new();
}

public class DashboardStatusSummary
{
    public TaskStatus Status { get; set; }

    public int Count { get; set; }
}

public class DashboardUserSummary
{
    public int UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public int TotalTasks { get; set; }

    public int ToDoTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int DoneTasks { get; set; }

    public int OverdueTasks { get; set; }
}