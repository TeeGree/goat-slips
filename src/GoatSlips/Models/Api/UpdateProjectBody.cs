namespace GoatSlips.Models.Api
{
    public class UpdateProjectBody
    {
        public int ProjectId { get; set; }
        public HashSet<int> AllowedTaskIds { get; set; } = new HashSet<int>();
        public decimal Rate { get; set; }
    }
}
