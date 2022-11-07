using GoatSlipsApi.Models.Database;

namespace GoatSlipsApi.Models
{
    public sealed class UserForManagement
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; } = string.Empty;
        public AccessRight[] AccessRights { get; set; } = new AccessRight[0];
    }
}
