using TeamTaskManagement.API.DTOs.Auth;

namespace TeamTaskManagement.API.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse> LoginAsync(LoginRequest request);
}