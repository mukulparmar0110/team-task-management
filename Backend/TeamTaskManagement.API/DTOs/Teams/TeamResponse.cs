namespace TeamTaskManagement.API.DTOs.Teams;

public class TeamResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public int CreatedById { get; set; }

    public string CreatedByName { get; set; } = string.Empty;

    public int MemberCount { get; set; }
}