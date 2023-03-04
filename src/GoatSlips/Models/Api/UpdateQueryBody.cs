namespace GoatSlips.Models.Api
{
    public sealed class UpdateQueryBody
    {
        public int QueryId { get; set; }
        public int[]? UserIds { get; set; }
        public int[]? ProjectIds { get; set; }
        public int[]? TaskIds { get; set; }
        public int[]? LaborCodeIds { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Description { get; set; }
    }
}
