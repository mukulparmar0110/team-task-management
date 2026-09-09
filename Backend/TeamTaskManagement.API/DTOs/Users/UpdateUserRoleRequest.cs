using System.ComponentModel.DataAnnotations;
using TeamTaskManagement.API.Models;

namespace TeamTaskManagement.API.DTOs.Users;

public class UpdateUserRoleRequest
{
    [Required]
    public UserRole Role { get; set; }
}