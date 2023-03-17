using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;

namespace GoatSlips.DAL
{
    public interface IConfigurationRepository
    {
        Configuration? Configuration { get; }
        byte GetMinutesPartition();
        byte GetFirstDayOfWeek();
        void SetMinutesPartition(byte newMinutesPartition);
        void SetFirstDayOfWeek(byte newFirstDayOfWeek);
    }
    public sealed class ConfigurationRepository : IConfigurationRepository
    {
        private const byte DefaultMinutesPartition = 1;
        private const byte DefaultFirstDayOfWeek = 0;

        private readonly HashSet<byte> AllowedMinutesPartitions = new HashSet<byte> { 1, 15, 30 };
        private readonly HashSet<byte> AllowedFirstDaysOfWeek = new HashSet<byte> { 0, 1, 2, 3, 4, 5, 6 };

        private DbSet<Configuration>? Configurations
        {
            get
            {
                DbSet<Configuration>? configurations = _dbContext.Configurations;
                if (configurations == null)
                {
                    throw new Exception("No configurations found!");
                }
                return configurations;
            }
        }

        public Configuration? Configuration
        {
            get
            {
                DbSet<Configuration>? configurations = _dbContext.Configurations;
                if (configurations == null)
                {
                    throw new Exception("No configurations found!");
                }
                return configurations?.FirstOrDefault();
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public ConfigurationRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public byte GetMinutesPartition()
        {
            return Configuration?.MinutesPartition ?? DefaultMinutesPartition;
        }

        public byte GetFirstDayOfWeek()
        {
            return Configuration?.FirstDayOfWeek ?? DefaultFirstDayOfWeek;
        }

        public void SetMinutesPartition(byte newMinutesPartition)
        {
            if (!AllowedMinutesPartitions.Contains(newMinutesPartition))
            {
                throw new Exception("New minutes partition doesn't match one of the allowed values.");
            }
            var configuration = Configuration ?? new Configuration();
            configuration.MinutesPartition = newMinutesPartition;
            Configurations.AddOrUpdate(configuration);
            _dbContext.SaveChanges();
        }

        public void SetFirstDayOfWeek(byte newFirstDayOfWeek)
        {
            if (!AllowedFirstDaysOfWeek.Contains(newFirstDayOfWeek))
            {
                throw new Exception("New first day of week doesn't match one of the allowed values.");
            }
            var configuration = Configuration ?? new Configuration();
            configuration.FirstDayOfWeek = newFirstDayOfWeek;
            Configurations.AddOrUpdate(configuration);
            _dbContext.SaveChanges();
        }
    }
}
