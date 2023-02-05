namespace GoatSlips.Models.Api
{
    public sealed class SetUserProjectsBody
    {
        public int UserId { get; set; }
        public HashSet<int> ProjectIds { get; set; } = new HashSet<int>();
    }
}
