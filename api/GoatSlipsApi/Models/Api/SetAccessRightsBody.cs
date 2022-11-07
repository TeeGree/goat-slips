namespace GoatSlipsApi.Models.Api
{
    public sealed class SetAccessRightsBody
    {
        public int UserId { get; set; }
        public HashSet<int> AccessRightIds { get; set; } = new HashSet<int>();
    }
}
