namespace GoatSlipsApi.Models
{
    public class SetAllowedTasksBody
    {
        public int ProjectId { get; set; }
        public HashSet<int> AllowedTaskIds { get; set; } = new HashSet<int>();
    }
}
