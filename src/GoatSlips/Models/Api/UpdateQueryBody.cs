namespace GoatSlips.Models.Api
{
    public sealed class UpdateQueryBody
    {
        public int QueryId { get; set; }
        public int? UserId { get; set; }
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
