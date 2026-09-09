using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.DTOs.Teams;

public class AddTeamMemberRequest
{
    [Required]
    public int UserId { get; set; }
}