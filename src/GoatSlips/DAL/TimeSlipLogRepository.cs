using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.DAL
{
    public interface ITimeSlipLogRepository
    {
        DbSet<TimeSlipLog> TimeSlipLogs { get; }
    }
    public sealed class TimeSlipLogRepository : ITimeSlipLogRepository
    {
        public DbSet<TimeSlipLog> TimeSlipLogs
        {
            get
            {
                DbSet<TimeSlipLog>? timeSlipLogs = _dbContext.TimeSlipLogs;
                if (timeSlipLogs == null)
                {
                    throw new Exception("No time slip log entries found!");
                }
                return timeSlipLogs;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public TimeSlipLogRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
