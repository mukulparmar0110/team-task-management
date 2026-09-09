using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.API.DTOs.Comments;

public class CommentCreateRequest
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
}