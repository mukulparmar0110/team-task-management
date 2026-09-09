using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.DTOs.Teams;

public class CreateTeamRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}