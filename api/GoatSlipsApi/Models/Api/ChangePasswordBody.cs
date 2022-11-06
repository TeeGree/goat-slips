namespace GoatSlipsApi.Models.Api
{
    public class ChangePasswordBody
    {
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
