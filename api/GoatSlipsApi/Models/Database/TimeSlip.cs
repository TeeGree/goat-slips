namespace GoatSlipsApi.Models.Database
{
    public class TimeSlip
    {
        public int Id { get; set; }
        public byte Hours { get; set; }
        public byte Minutes { get; set; }
        public DateTime Date { get; set; }
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
    }
}
