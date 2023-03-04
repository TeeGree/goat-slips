namespace GoatSlips.Models.Api
{
    public class GetTimeSlipsBody
    {
        public int[]? UserIds { get; set; }
        public int[]? ProjectIds { get; set; }
        public int[]? TaskIds { get; set; }
        public int[]? LaborCodeIds { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string DescriptionSearchText { get; set; } = string.Empty;
    }
}
