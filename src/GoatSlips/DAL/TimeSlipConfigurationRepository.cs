using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;

namespace GoatSlips.DAL
{
    public interface ITimeSlipConfigurationRepository
    {
        TimeSlipConfiguration? Configuration { get; }
        byte GetMinutesPartition();
        void SetMinutesPartition(byte newMinutesPartition);

    }
    public sealed class TimeSlipConfigurationRepository
    {
        private const byte DefaultMinutesPartition = 1;

        private readonly HashSet<byte> AllowedMinutesPartitions = new HashSet<byte> { 1, 15, 30 };

        private DbSet<TimeSlipConfiguration>? Configurations
        {
            get
            {
                DbSet<TimeSlipConfiguration>? timeSlipConfigurations = _dbContext.TimeSlipConfigurations;
                if (timeSlipConfigurations == null)
                {
                    throw new Exception("No time slips found!");
                }
                return timeSlipConfigurations;
            }
        }

        public TimeSlipConfiguration? Configuration
        {
            get
            {
                DbSet<TimeSlipConfiguration>? timeSlipConfigurations = _dbContext.TimeSlipConfigurations;
                if (timeSlipConfigurations == null)
                {
                    throw new Exception("No time slips found!");
                }
                return timeSlipConfigurations?.First();
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public TimeSlipConfigurationRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public byte GetMinutesPartition()
        {
            return Configuration?.MinutesPartition ?? DefaultMinutesPartition;
        }

        public void SetMinutesPartition(byte newMinutesPartition)
        {
            if (!AllowedMinutesPartitions.Contains(newMinutesPartition))
            {
                throw new Exception("New minutes partition is not allowed.");
            }
            var configuration = Configuration ?? new TimeSlipConfiguration();
            configuration.MinutesPartition = newMinutesPartition;
            Configurations.AddOrUpdate(configuration);
            _dbContext.SaveChanges();
        }
    }
}
