using GoatSlipsApi.DAL;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.Services
{
    public interface ITimeSlipService
    {
        IEnumerable<TimeSlip> GetAllTimeSlips();
        TimeSlip[] GetTimeSlipsForCurrentUser(HttpContext httpContext);
        void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext);
        void UpdateTimeSlip(UpdateTimeSlipBody timeSlip);
        void DeleteTimeSlip(int id);
        TimeSlip[] GetTimeSlips(
            int[]? userIds,
            int[]? projectIds,
            int?[]? taskIds,
            int?[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        );
    }
    public class TimeSlipService : ITimeSlipService
    {
        private readonly IGoatSlipsContext _dbContext;

        public TimeSlipService(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IEnumerable<TimeSlip> GetAllTimeSlips()
        {
            DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }
            return timeSlips;
        }

        public TimeSlip[] GetTimeSlipsForCurrentUser(HttpContext httpContext)
        {
            User? user = httpContext.Items["User"] as User;
            if (user == null)
            {
                throw new Exception("No user logged in!");
            }

            DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }
            return timeSlips.Where(ts => ts.UserId == user.Id).ToArray();
        }

        public void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext)
        {
            User? user = httpContext.Items["User"] as User;
            if (user == null)
            {
                throw new Exception("No user logged in!");
            }

            var timeSlipToAdd = new TimeSlip
            {
                Hours = timeSlip.Hours,
                Minutes = timeSlip.Minutes,
                Date = timeSlip.Date,
                ProjectId = timeSlip.ProjectId,
                TaskId = timeSlip.TaskId,
                LaborCodeId = timeSlip.LaborCodeId,
                UserId = user.Id
            };

            _dbContext.TimeSlips?.Add(timeSlipToAdd);
            _dbContext.SaveChanges();
        }

        public void UpdateTimeSlip(UpdateTimeSlipBody timeSlip)
        {
            TimeSlip? timeSlipFromDb = _dbContext.TimeSlips?.First(ts => ts.Id == timeSlip.TimeSlipId);
            if (timeSlipFromDb == null)
            {
                throw new Exception("Time slip not found!");
            }

            timeSlipFromDb.Hours = timeSlip.Hours;
            timeSlipFromDb.Minutes = timeSlip.Minutes;
            timeSlipFromDb.ProjectId = timeSlip.ProjectId;
            timeSlipFromDb.TaskId = timeSlip.TaskId;
            timeSlipFromDb.LaborCodeId = timeSlip.LaborCodeId;

            _dbContext.SaveChanges();
        }

        public void DeleteTimeSlip(int id)
        {
            TimeSlip? timeSlip = _dbContext.TimeSlips?.First(ts => ts.Id == id);
            if (timeSlip == null)
            {
                throw new Exception("Time slip not found!");
            }

            _dbContext.TimeSlips?.Remove(timeSlip);
            _dbContext.SaveChanges();
        }

        public TimeSlip[] GetTimeSlips(
            int[]? userIds,
            int[]? projectIds,
            int?[]? taskIds,
            int?[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            // TODO: Allow selecting blank
            DbSet<TimeSlip>? timeSlips = _dbContext?.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }

            IQueryable<TimeSlip> timeSlipsQueryable = timeSlips.AsQueryable();

            if (userIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => userIds.Contains(ts.UserId));
            }

            if (projectIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => projectIds.Contains(ts.ProjectId));
            }

            if (taskIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => taskIds.Contains(ts.TaskId));
            }

            if (laborCodeIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => laborCodeIds.Contains(ts.LaborCodeId));
            }

            if (fromDate.HasValue)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => ts.Date >= fromDate);
            }

            if (toDate.HasValue)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => ts.Date <= toDate);
            }

            return timeSlipsQueryable.ToArray();
        }
    }
}
