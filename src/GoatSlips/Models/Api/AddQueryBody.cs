namespace GoatSlips.Models.Api
{
    public sealed class AddQueryBody
    {
        public string Name { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
