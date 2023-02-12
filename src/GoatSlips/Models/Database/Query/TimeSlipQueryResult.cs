namespace GoatSlips.Models.Database.Query
{
    public sealed class TimeSlipQueryResult : TimeSlipBase
    {
        public TimeSlipQueryResult(TimeSlip timeSlip, decimal rate)
        {
            Id = timeSlip.Id;
            Hours = timeSlip.Hours;
            Minutes = timeSlip.Minutes;
            Date = timeSlip.Date;
            UserId = timeSlip.UserId;
            ProjectId = timeSlip.ProjectId;
            TaskId = timeSlip.TaskId;
            LaborCodeId = timeSlip.LaborCodeId;
            Description = timeSlip.Description;

            decimal hours = timeSlip.Hours + (timeSlip.Minutes / 60m);
            Cost = Math.Round(rate * hours, 2);
        }

        public int Id { get; set; }
        public decimal Cost { get; set; }
    }
}
