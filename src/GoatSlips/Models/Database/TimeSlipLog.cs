using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database
{
    public sealed class TimeSlipLog
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int TimeSlipId { get; set; }
        public byte? OldHours { get; set; }
        public byte? OldMinutes { get; set; }
        public DateTime? OldDate { get; set; }
        public int? OldUserId { get; set; }
        public int? OldProjectId { get; set; }
        public int? OldTaskId { get; set; }
        public int? OldLaborCodeId { get; set; }
        public string? OldDescription { get; set; }
        public byte? NewHours { get; set; }
        public byte? NewMinutes { get; set; }
        public DateTime? NewDate { get; set; }
        public int? NewUserId { get; set; }
        public int? NewProjectId { get; set; }
        public int? NewTaskId { get; set; }
        public int? NewLaborCodeId { get; set; }
        public string? NewDescription { get; set; }
        public DateTime TimeStamp { get; set; }
        public string UpdateType { get; set; }
        public int UpdateUserId { get; set; }
    }
}
