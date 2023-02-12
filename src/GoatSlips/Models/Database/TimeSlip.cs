using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database
{
    public sealed class TimeSlip : TimeSlipBase
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
    }
}
