using GoatSlips.Constants;
using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database
{
    public sealed class Configuration
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public byte MinutesPartition { get; set; } = ConfigurationDefaults.DefaultMinutesPartition;
        public byte FirstDayOfWeek { get; set; } = ConfigurationDefaults.DefaultFirstDayOfWeek;
    }
}
