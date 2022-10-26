using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;

namespace GoatSlipsApi.DAL
{
    public interface ITimeSlipRepository
    {
        DbSet<TimeSlip> TimeSlips { get; }
        void ClearTaskIdsForTimeSlips(int projectId, IEnumerable<int> taskIds);
    }
    public sealed class TimeSlipRepository : ITimeSlipRepository
    {
        public DbSet<TimeSlip> TimeSlips
        {
            get
            {
                DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
                if (timeSlips == null)
                {
                    throw new Exception("No time slips found!");
                }
                return timeSlips;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public TimeSlipRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void ClearTaskIdsForTimeSlips(int projectId, IEnumerable<int> taskIds)
        {
            TimeSlip[] projectTimeSlips = TimeSlips.Where(ts => ts.ProjectId == projectId).ToArray();

            TimeSlip[] timeSlipsToClearTaskIds = projectTimeSlips.Where(ts =>
                taskIds.Any(id => id == ts.TaskId)
            ).ToArray();

            foreach (TimeSlip timeSlip in timeSlipsToClearTaskIds)
            {
                timeSlip.TaskId = null;
                TimeSlips.AddOrUpdate(timeSlip);
            }

            _dbContext.SaveChanges();
        }
    }
}
