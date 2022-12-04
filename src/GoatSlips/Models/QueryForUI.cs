namespace GoatSlips.Models
{
    public sealed class QueryForUI
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IEnumerable<int> UserIds { get; set; } = new int[0];
        public IEnumerable<int> ProjectIds { get; set; } = new int[0];
        public IEnumerable<int> TaskIds { get; set; } = new int[0];
        public IEnumerable<int> LaborCodeIds { get; set; } = new int[0];
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
