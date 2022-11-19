namespace GoatSlips.Models.Api
{
    public class SetAllowedTasksBody
    {
        public int ProjectId { get; set; }
        public HashSet<int> AllowedTaskIds { get; set; } = new HashSet<int>();
    }
}
