namespace GoatSlipsApi.Models.Database
{
    public sealed class ProjectTask
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int TaskId { get; set; }
    }
}
