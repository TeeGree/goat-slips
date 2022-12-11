namespace GoatSlips.Models.Api
{
    public class AddTimeSlipBody
    {
        public byte Hours { get; set; }
        public byte Minutes { get; set; }
        public DateTime[] Dates { get; set; } = new DateTime[0];
        public int ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
