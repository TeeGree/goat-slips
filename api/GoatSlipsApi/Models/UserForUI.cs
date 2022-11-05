namespace GoatSlipsApi.Models
{
    public class UserForUI
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public bool RequiresPasswordChange { get; set; } = false;
    }
}
