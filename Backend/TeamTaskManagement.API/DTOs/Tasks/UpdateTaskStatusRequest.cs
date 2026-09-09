using System.ComponentModel.DataAnnotations;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Tasks;

public class UpdateTaskStatusRequest
{
    [Required]
    public TeamTaskManagement.API.Models.TaskStatus Status { get; set; }
}