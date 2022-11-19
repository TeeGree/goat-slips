namespace GoatSlips.Models.Database
{
    public class ProjectTaskMapping
    {
        public int ProjectId { get; set; }
        public IEnumerable<int>? AllowedTaskIds { get; set; }
    }
}
