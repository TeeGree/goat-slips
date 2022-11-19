namespace GoatSlips.Models.Api
{
    public class UpdateTimeSlipBody
    {
        public int TimeSlipId { get; set; }
        public byte Hours { get; set; }
        public byte Minutes { get; set; }
        public int ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
    }
}
